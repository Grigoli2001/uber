from flask import Blueprint, render_template,url_for,session,redirect, current_app, flash
import os
import sqlite3
import logging
from werkzeug.utils import secure_filename

from ..APIs.sqLite import conn_db
from ..forms.forms import RegistrationForm, DriverRegistrationForm
from .user_login import load_user
from flask_login import current_user, login_user
register = Blueprint('register',__name__)


@register.route('/', methods = ['GET','POST'])
def registration():
    if current_user.is_authenticated:
        return redirect(url_for('root.home'))
    if 'email' not in session:
        return redirect(url_for('login_blueprint.login_logic'))
    form = RegistrationForm()
    if form.validate_on_submit():
        logging.info("form validated")
        firstname = form.firstname.data
        lastname = form.lastname.data
        phone_number = form.phone_number.data
        email = session['email']
        try:
            db = conn_db()
            cursor = db.cursor()
            cursor.execute('INSERT INTO users (email,firstname,lastname,phone_number,role) VALUES (?,?,?,?,?)',(email,firstname,lastname,phone_number,'user'))
            db.commit()
            print("user registered")
            
            cursor.execute('SELECT * FROM users WHERE email = ?',(email,))
            user = cursor.fetchone()
            Us = load_user(user[0])
            login_user(Us)
            session.pop('email', None)
            return redirect(url_for('root.home'))

        except Exception as e:
            print(e)
            flash("Something went wrong, please try again later")

        
    return render_template('user/user_register.html', form = form)


@register.route('/driver', methods = ['GET','POST'])
def driver_registration():
    if current_user.is_authenticated:
        return redirect(url_for('root.home'))
    if 'email' not in session:
        return redirect(url_for('login_blueprint.login_logic'))
    form = DriverRegistrationForm()
    if form.validate_on_submit():
        logging.info("form validated")
        firstname = form.firstname.data
        lastname = form.lastname.data
        phone_number = form.phone_number.data
        profile_pic = form.profile_pic.data
        car_type = form.car_type.data
        car_number = form.car_number.data
        license_pic = form.license_pic.data
        car_pic = form.car_pic.data
        email = session['email']

        try:
            profile_pic_filename = secure_filename(profile_pic.filename)
            profile_pic_path = os.path.join(current_app.config['UPLOAD_FOLDER'], profile_pic_filename)
            profile_pic.save(profile_pic_path)
            
            # Save the image path in the database
            profile_pic_db_path = os.path.join('static', 'uploads', profile_pic_filename)
        except Exception as e:
            logging.error(e)
            profile_pic_db_path = None

        try:
            license_pic_filename = secure_filename(license_pic.filename)
            license_pic_path = os.path.join(current_app.config['UPLOAD_FOLDER'], license_pic_filename)
            license_pic.save(license_pic_path)
            
            # Save the image path in the database
            license_pic_db_path = os.path.join('static', 'uploads', license_pic_filename)
        except Exception as e:
            license_pic_db_path = None
            logging.error(e)

        try:
            car_pic_filename = secure_filename(car_pic.filename)
            car_pic_path = os.path.join(current_app.config['UPLOAD_FOLDER'], car_pic_filename)
            car_pic.save(car_pic_path)
            
            # Save the image path in the database
            car_pic_db_path = os.path.join('static', 'uploads', car_pic_filename)
        except Exception as e:
            car_pic_db_path = None
            logging.error(e)
        try:
            db = conn_db()
            cursor = db.cursor()
            cursor.execute('INSERT INTO users (email,firstname,lastname,phone_number,role,profile_pic,car_type,car_number,license_pic, car_pic) VALUES (?,?,?,?,?,?,?,?,?,?)',(email,firstname,lastname,phone_number,'driver',profile_pic_db_path,car_type,car_number,license_pic_db_path,car_pic_db_path))
            db.commit()
            print("driver registered")
            
            cursor.execute('SELECT * FROM users WHERE email = ?',(email,))
            user = cursor.fetchone()
            Us = load_user(user[0])
            login_user(Us)
            session.pop('email', None)
            return redirect(url_for('driver.home'))
        
        
        except Exception as e:
            logging.error(e)
            flash("Something went wrong, please try again later")

    return render_template('driver/driver_register.html', form = form)