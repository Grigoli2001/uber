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


# this is how I save ride request
#  db = client['uber']
#     collection = db['ride_requests']

#     # Check if user has already requested a ride
#     ride_request = collection.find_one({'user_id': user_id})
#     if ride_request:
#         if ride_request['status'] in ['pending', 'accepted']:
#             # return an error message
#             return jsonify({'status': 'error', 'message': 'You have already requested a ride'}), 400
#     collection.insert_one({
#         'user_id': user_id,
#         'pickup': pickup,
#         'destination': destination,
#         'status': 'pending',
#         'created_at': datetime.now(),
#         'updated_at': datetime.now()
#     })
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


# check for changes in ride_requests collection to notify the socket
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