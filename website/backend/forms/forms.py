from flask_wtf import FlaskForm
from wtforms import StringField, PasswordField, SubmitField,TextAreaField,FileField,RadioField, IntegerField
from wtforms.validators import DataRequired, Email, Length, EqualTo, ValidationError, number_range
from flask_wtf.file import  FileAllowed


class RegistrationForm(FlaskForm):
    firstname=StringField("First Name", validators=[DataRequired(),Length(min=2,max=20)])
    lastname=StringField("Last Name", validators=[DataRequired(),Length(min=2,max=20)])
    phone_number=StringField("Phone Number", validators=[DataRequired(),Length(min=6,max=12)])
    # password = PasswordField('Password',validators=[DataRequired(),Length(min=6)])
    # confirm_password = PasswordField('Confirm Password', validators=[DataRequired(),EqualTo('password')])
    # card_number=StringField("Card Number", validators=[DataRequired(),Length(min=16,max=16)])
    # cvv=StringField("CVV", validators=[DataRequired(),Length(min=3,max=3)])
    # expiry_date=StringField("Expiry Date", validators=[DataRequired(),Length(min=5,max=5)])
    submit = SubmitField('Sign Up') 


class LoginForm(FlaskForm):
    email=StringField("Email Address", validators=[DataRequired(),Email()])
    submit = SubmitField('Continue')


class OtpForm(FlaskForm):
    otp1 = StringField( validators=[DataRequired()])
    otp2 = StringField( validators=[DataRequired()])
    otp3 = StringField( validators=[DataRequired()])
    otp4 = StringField( validators=[DataRequired()])
    submit = SubmitField('Verify OTP')

class DriverRegistrationForm(FlaskForm):
    firstname=StringField("First Name", validators=[DataRequired(),Length(min=2,max=20)])
    lastname=StringField("Last Name", validators=[DataRequired(),Length(min=2,max=20)])
    phone_number=StringField("Phone Number", validators=[DataRequired(),Length(min=6,max=12)])

    profile_pic = FileField("Upload Profile Picture", validators=[FileAllowed(['jpg','png'])])
    car_type = RadioField('Car Type', choices=[('hatchback','Hatchback'),('sedan','Sedan'),('suv','SUV')], validators=[DataRequired()])
    car_number = StringField("Car Number", validators=[DataRequired(),Length(min=6,max=12)])
    license_pic = FileField("Upload License", validators=[FileAllowed(['jpg','png'])])
    car_pic = FileField("Upload Car Picture", validators=[FileAllowed(['jpg','png'])])
    submit = SubmitField('Sign Up')
