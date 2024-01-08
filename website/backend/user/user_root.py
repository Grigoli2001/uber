import logging
import os
import sqlite3
import time
from datetime import datetime

from bson import ObjectId
from flask import (Blueprint, current_app, flash, g, jsonify, redirect,
                   render_template, request, url_for, session)
from flask_login import current_user, login_required, logout_user
from werkzeug.utils import secure_filename

from ..APIs.mongoDB import client
from ..APIs.sqLite import conn_db
# from .login import User
root = Blueprint('root',__name__)

@root.route('/')
def home():
    if current_user.is_authenticated:
        return redirect(url_for('root.ride'))
    
    return render_template('home.html')

@root.route('/users')
def show_users():
    # Fetch all user data from the database
    db = conn_db()
    cursor = db.cursor()
    cursor.execute('SELECT * FROM users')
    users = cursor.fetchall()

    # Pass the user data to the template
    return jsonify(users)

@root.route('/logout')
def logout():
    logout_user()
    session.clear()
    return redirect(url_for('login_blueprint.login_logic'))



@login_required
@root.route('/ride', methods=['GET', 'POST'])
def ride():
    if not current_user.is_authenticated:
        return redirect(url_for('login_blueprint.login_logic'))
    if request.method == 'POST':
        pickup = request.form.get('pickup')
        destination = request.form.get('destination')
        logging.info(f'Pickup: {pickup}, Destination: {destination}')
        return render_template('user/user_ride.html', pickup=pickup, destination=destination)
    return render_template('user/user_ride.html')

@login_required
@root.route('/ride/request', methods=['POST'])
def ride_request():
    if not current_user.is_authenticated:
        return redirect(url_for('login_blueprint.login_logic'))
    data = request.json
    pickup = data['startLocation']
    destination = data['endLocation']
    user_id = current_user.get_id()
    price = data['taxiPrice']
    logging.info(f'Pickup: {pickup}, Destination: {destination}')
    logging.info(f'User ID: {user_id}')
    db = client['uber']
    collection = db['ride_requests']

    # Check if user has already requested a ride
    ride_request = collection.find_one({'user_id': user_id})
    if ride_request:
        if ride_request['status'] in ['pending', 'accepted']:
            # return an error message
            return jsonify({'status': 'error', 'message': 'You have already requested a ride'}), 400
    collection.insert_one({
        'user_id': user_id,
        'pickup': pickup,
        'destination': destination,
        'status': 'pending',
        'created_at': datetime.now(),
        'updated_at': datetime.now()
    })

    return jsonify({'status': 'pending', 'message': 'Waiting for driver acceptance'}), 200

@login_required
@root.route('/ride/request/status', methods=['GET'])
def ride_request_status():
    if not current_user.is_authenticated:
        return redirect(url_for('login_blueprint.login_logic'))
    user_id = current_user.get_id()
    logging.info(f'User ID: {user_id}')
    db = client['uber']
    collection = db['ride_requests']
    ride_request = collection.find_one({'user_id': user_id})
    if ride_request['status']:
        if ride_request['status'] == 'pending':
            return jsonify({'status': ride_request['status'], 'message': 'Waiting for driver acceptance', 'pickup' : ride_request['pickup'], 'destination' : ride_request['destination']}), 200
        elif ride_request['status'] == 'accepted':
            return jsonify({'status': ride_request['status'], 'message': 'Driver accepted your request'}), 200
    return jsonify({'status': 'not_found', 'message': 'No ride request found'}), 404

@login_required
@root.route('/ride/request/cancel', methods=['GET'])
def ride_request_cancel():
    if not current_user.is_authenticated:
        return redirect(url_for('login_blueprint.login_logic'))
    user_id = current_user.get_id()
    logging.info(f'User ID: {user_id}')
    db = client['uber']
    collection = db['ride_requests']
    ride_request = collection.find_one({'user_id': user_id})
    if ride_request['status'] == 'pending':
        collection.delete_one({'user_id': user_id})
        return jsonify({'status': 'success', 'message': 'Ride request cancelled'}), 200
    elif ride_request['status'] == 'accepted':
        return jsonify({'status': 'error', 'message': 'Cannot cancel ride request after driver acceptance'}), 400
    return jsonify({'status': 'not_found', 'message': 'No ride request found'}), 404