import logging
from flask import Blueprint, render_template, request, redirect, url_for, session, flash, jsonify
from flask_login import current_user, login_required
from ..APIs.sqLite import conn_db
from ..APIs.mongoDB import client
from bson import ObjectId
from datetime import datetime

driver = Blueprint('driver', __name__)

@driver.route('/')
def home():
    # get requested rides from mongoDB
    db = client['uber']
    collection = db['ride_requests']
    ride_requests = collection.find()
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
    return jsonify({'status': 'success', 'message': 'Ride accepted'}), 200