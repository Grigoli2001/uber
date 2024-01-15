import logging
from flask import Blueprint, render_template, request, redirect, url_for, session, flash, jsonify
from flask_login import current_user, login_required
from ..APIs.sqLite import conn_db
from ..APIs.mongoDB import client
from bson import ObjectId
from datetime import datetime
from flask_socketio import emit
from threading import Thread
from pymongo.errors import OperationFailure

driver = Blueprint('driver', __name__)

@driver.route('/')
def home():
    # get requested rides from mongoDB
    db = client['uber']
    collection = db['ride_requests']
    ride_requests = collection.find()
    logging.info(ride_requests)
    Thread(target=check_for_updates).start()
    return render_template('driver/driver_home.html', ride_requests=ride_requests)


@driver.route('/ride/accept', methods=['POST'])
def accept_ride():
    if not current_user.is_authenticated:
        return redirect(url_for('login_blueprint.login_logic'))
    data = request.json
    ride_id = data['id']
    logging.info(f'Ride ID: {ride_id}')
    db = client['uber']
    collection = db['ride_requests']
    collection.update_one({'_id': ObjectId(ride_id)}, {'$set': {'status': 'accepted'}})

    # send a socket message to the user
    emit('ride_updated', {'message': 'Ride status updated!'}, broadcast=True, namespace='/')

    return jsonify({'status': 'success', 'message': 'Ride accepted'}), 200


# @driver.route('/ride/reject', methods=['POST'])
# def reject_ride():
#     if not current_user.is_authenticated:
#         return redirect(url_for('login_blueprint.login_logic'))
#     data = request.json
#     ride_id = data['id']
#     driver_id = current_user.get_id()
#     logging.info(f'Ride ID: {ride_id}')
#     db = client['uber']
#     collection = db['ride_requests']
#     collection.update_one({'_id': ObjectId(ride_id)}, {'$set': {'status': 'rejected'}})

#     # send a socket message to the user
#     emit('ride_updated', {'message': 'Ride status updated!'}, broadcast=True, namespace='/')

#     return jsonify({'status': 'success', 'message': 'Ride rejected'}), 200

@driver.route('/ride/reject', methods=['POST'])
def reject_ride():
    print("rejecting ride")
    if not current_user.is_authenticated:
        return redirect(url_for('login_blueprint.login_logic'))
    
    data = request.json
    ride_id = data['id']
    driver_id = str(current_user.get_id())  # Convert driver_id to string
    print(driver_id)
    
    logging.info(f'Ride ID: {ride_id}')
    db = client['uber']
    collection = db['ride_requests']
    ride_request = collection.find_one({'_id': ObjectId(ride_id)})
    all_requests_collection = db['all_requests']
    if not ride_request:
        logging.info('Ride not found')
        return jsonify({'status': 'error', 'message': 'Ride not found'}), 404
    
    if ride_request['status'] == 'accepted':
        logging.info('Ride already accepted')
        return jsonify({'status': 'error', 'message': 'Ride already accepted'}), 400
    
    print(ride_request['request_sent_to_driver'])
    
    # Extract driver IDs from the array of dictionaries
    driver_ids = [str(driver_info['id']) for driver_info in ride_request['request_sent_to_driver']]
    print(driver_ids)
    
    if driver_id in driver_ids:
        print("driver found in request")
        
        # Update the status for the specific driver
        for driver_info in ride_request['request_sent_to_driver']:
            if str(driver_info['id']) == driver_id:
                logging.info('Updating status for driver')
                # updating in memory
                driver_info['status'] = 'rejected'

                # update the status for the driver in mongodb
                result = collection.update_one({'_id': ObjectId(ride_id), 'request_sent_to_driver.id': int(driver_id)}, {'$set': {'request_sent_to_driver.$.status': 'rejected'}})
                print(result)
                break
        print(all(driver_info['status'] == 'rejected' for driver_info in ride_request['request_sent_to_driver']))
        if all(driver_info['status'] == 'rejected' for driver_info in ride_request['request_sent_to_driver']):
            logging.info('All drivers rejected the ride')
            #  remove from the ride_requests collection
            result = collection.delete_one({'_id': ObjectId(ride_id)})
            print(result)
            emit('ride_updated', {'message': 'Ride status updated!'}, broadcast=True, namespace='/')
            return jsonify({'status': 'success', 'message': 'Ride rejected'}), 200
        else:
            emit('ride_updated', {'message': 'Driver response updated!'}, broadcast=True, namespace='/')
            return jsonify({'status': 'success', 'message': 'Driver response updated'}), 200
    else:
        return jsonify({'status': 'error', 'message': 'Driver not found in request'}), 400

# # check for changes in ride_requests collection to notify the socket
def check_for_updates():
    db = client['uber']
    logging.info('Starting thread for checking updates.')
    
    try:
        collection = db['ride_requests']
        
        # Use change_stream method to watch for updates
        with collection.watch(full_document='updateLookup') as stream:
            for change in stream:
                logging.info(change)
                emit('ride_updated', {'message': 'Ride status updated!'}, broadcast=True, namespace='/')
    except OperationFailure as e:
        logging.error(f"Error while watching for updates: {e}")