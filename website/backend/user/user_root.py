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
    if session.get('code'):
        print(session['code'])
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