import logging
from flask import Blueprint, render_template, request, redirect, url_for, session, flash
from flask_login import current_user, login_required
from ..APIs.sqLite import conn_db

driver = Blueprint('driver', __name__)

@driver.route('/')
def home():
    return render_template('driver/driver_home.html')