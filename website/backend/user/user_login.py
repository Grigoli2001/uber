from flask import Blueprint, render_template,url_for,redirect, request, flash, session
from flask_login import  UserMixin, login_user,current_user, logout_user 
from ..APIs.sqLite import conn_db

from ... import login_manager
from flask_login import LoginManager
from ..forms.forms import LoginForm, OtpForm
import logging
login_blueprint = Blueprint('login_blueprint',__name__)




class User(UserMixin):
    def __init__(self,id):
        self.id = id
        self.email = None
        self.password = None
        self.profile_pic = 'https://static.vecteezy.com/system/resources/thumbnails/003/337/584/small/default-avatar-photo-placeholder-profile-icon-vector.jpg'
        self.fullname = None
        self.authenticated = False
        self.role = None # admin, user, driver
        self.car_type = None
        self.car_number = None
        self.phone_number = None
        self.license_pic = None
        self.car_pic = None
        
    def is_anonymous(self):
         return False
    def is_authenticated(self):
         return self.authenticated
    def is_active(self):
         return True
    def get_id(self):
         return self.id
    def __repr__(self):
        return '<User %r>' % (self.fullname)
    def is_admin(self):
        if self.role == 'admin':
            return True
    def is_user(self):
        if self.role == 'user':
            return True
    def is_driver(self):
        if self.role == 'driver':
            return True
    def getProfilePic(self):
        return self.profile_pic
    
    def getCarType(self):
        return self.car_type    
    def getCarNumber(self):
        return self.car_number
    def getPhoneNumber(self):
        return self.phone_number
    def getLicensePic(self):
        return self.license_pic
    def getCarPic(self):
        return self.car_pic


@login_manager.user_loader
def load_user(user_id):
     # Fetch user data from the database
    db = conn_db()
    cursor = db.cursor()
    cursor.execute('SELECT * FROM users WHERE id = ?', (user_id,))
    user = cursor.fetchone()
    if user is not None:  # Check if a user is found
        cur_user = User(id=user_id)
        cur_user.email = user[1]
        cur_user.firstname = user[2]
        cur_user.lastname = user[3]
        cur_user.phone_number = user[4]
        cur_user.role = user[5]
        if user[6]:
            cur_user.profile_pic = user[6]
        if user[7]:
            cur_user.password = user[7]
        if user[8]:
            cur_user.car_type = user[8]
        if user[9]:
            cur_user.car_number = user[9]
        if user[10]:
            cur_user.license_pic = user[10]
        if user[11]:
            cur_user.car_pic = user[11]
        
        return cur_user

    return None  # Return None if no user is found

def email_exists(email, role):
    db = conn_db()
    cursor = db.cursor()
    cursor.execute('SELECT * FROM users WHERE email = ? and role = ?',(email,role,))
    user = cursor.fetchone()
    if user:
        return True
    else:
        return False




# -------------------------routes------------
@login_blueprint.route('/',methods = ['GET','POST'])
def login_logic():
    form = LoginForm()
    if current_user.is_authenticated:
         logging.info("user is authenticated")
         return redirect(url_for('root.home'))
    if form.validate_on_submit():
        logging.info("form validated")
        email = form.email.data.lower()
        session['email'] = email
        user = email_exists(email, 'user')
        
        if user:
            logging.info( email + " user exists")
            # Us = load_user(user[0])
            # login_user(Us)
            return redirect(url_for('login_blueprint.verifyOtpExisting'))
        else:
            logging.info(email + " user doesn't exist")
            return redirect(url_for('login_blueprint.verifyOtp'))

    return render_template('/user/user_login.html', form = form)


@login_blueprint.route('/verify',methods = ['GET','POST'])
def verifyOtpExisting():
    if 'email' not in session:
        return redirect(url_for('login_blueprint.login_logic'))
    form = OtpForm()
    if form.validate_on_submit():
        logging.info("form validated")
        otp1 = form.otp1.data
        otp2 = form.otp2.data
        otp3 = form.otp3.data
        otp4 = form.otp4.data
        otp = int(otp1+otp2+otp3+otp4)
        from ..APIs.otp import verify_2fa
        if verify_2fa(otp):
            db = conn_db()
            cursor = db.cursor()
            cursor.execute('SELECT * FROM users WHERE email = ?',(session['email'],))
            user = cursor.fetchone()
            Us = load_user(user[0])
            login_user(Us)
            session.pop('email', None)
            return redirect(url_for('root.home'))
        flash("OTP is incorrect")
    else:
        from ..APIs.otp import send_2fa_email
        send_2fa_email(session['email'])
    return render_template('/user/verifyOtp.html' , form = form)

@login_blueprint.route('/verifyNew',methods = ['GET','POST'])
def verifyOtp():

    if 'email' not in session:
        return redirect(url_for('login_blueprint.login_logic'))
    form = OtpForm()
    if form.validate_on_submit():
        print("form validated")
        otp1 = form.otp1.data
        otp2 = form.otp2.data
        otp3 = form.otp3.data
        otp4 = form.otp4.data
        otp = int(otp1+otp2+otp3+otp4)
        from ..APIs.otp import verify_2fa
        if verify_2fa(otp):
            logging.info("otp verified")
            
            return redirect(url_for('register.registration'))
        
        flash("OTP is incorrect")
    else:
        from ..APIs.otp import send_2fa_email
        send_2fa_email(session['email'])
    return render_template('/user/verifyOtp.html' , form = form)


# driver login

@login_blueprint.route('/driver',methods = ['GET','POST'])
def driver_login_logic():
    form = LoginForm()
    if current_user.is_authenticated:
            logging.info("user is authenticated")
            return redirect(url_for('root.home'))
    if form.validate_on_submit():
        logging.info("form validated")
        email = form.email.data.lower()
        session['email'] = email
        user = email_exists(email,'driver')
        
        if user:
            logging.info( email + " user exists")
            # Us = load_user(user[0])
            # login_user(Us)
            return redirect(url_for('login_blueprint.verifyOtpDriver'))
        else:
            logging.info(email + " user doesn't exist")
            return redirect(url_for('login_blueprint.verifyOtpDriverNew'))
    
    return render_template('/driver/driver_login.html', form = form)

@login_blueprint.route('/driver/verify' , methods = ['GET','POST'])
def verifyOtpDriver():
    if 'email' not in session:
        return redirect(url_for('login_blueprint.login_logic'))
    form = OtpForm()
    if form.validate_on_submit():
        logging.info("form validated")
        otp1 = form.otp1.data
        otp2 = form.otp2.data
        otp3 = form.otp3.data
        otp4 = form.otp4.data
        otp = int(otp1+otp2+otp3+otp4)
        from ..APIs.otp import verify_2fa
        if verify_2fa(otp):
            db = conn_db()
            cursor = db.cursor()
            cursor.execute('SELECT * FROM users WHERE email = ?',(session['email'],))
            user = cursor.fetchone()
            Us = load_user(user[0])
            login_user(Us)
            session.pop('email', None)
            return redirect(url_for('driver.home'))
        flash("OTP is incorrect")
    else:
        from ..APIs.otp import send_2fa_email
        send_2fa_email(session['email'])
    return render_template('/user/verifyOtp.html' , form = form)

@login_blueprint.route('/driver/verifyNew' , methods = ['GET','POST'])
def verifyOtpDriverNew():
    if 'email' not in session:
        return redirect(url_for('login_blueprint.login_logic'))
    form = OtpForm()
    if form.validate_on_submit():
        logging.info("form validated")
        otp1 = form.otp1.data
        otp2 = form.otp2.data
        otp3 = form.otp3.data
        otp4 = form.otp4.data
        otp = int(otp1+otp2+otp3+otp4)
        from ..APIs.otp import verify_2fa
        if verify_2fa(otp):
            logging.info("otp verified")
            return redirect(url_for('register.driver_registration'))
        flash("OTP is incorrect")
    else:
        from ..APIs.otp import send_2fa_email
        send_2fa_email(session['email'])
    return render_template('/user/verifyOtp.html' , form = form)