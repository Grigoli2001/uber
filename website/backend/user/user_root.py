import logging
import os
import sqlite3
import time
from datetime import datetime

from bson import ObjectId
from flask import (Blueprint, current_app, flash, g, jsonify, redirect,
                   render_template, request, url_for)
from flask_login import current_user, login_required, logout_user
from werkzeug.utils import secure_filename

from ..APIs.mongoDB import client
from ..APIs.sqLite import conn_db
# from .login import User
root = Blueprint('root',__name__)

@root.route('/')
def index():
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
