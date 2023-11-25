from flask_wtf import FlaskForm
from wtforms import StringField, PasswordField, SubmitField,TextAreaField,FileField,RadioField
from wtforms.validators import DataRequired, Email, Length, EqualTo, ValidationError
from flask_wtf.file import  FileAllowed


class RegistrationForm(FlaskForm):
    profile_pic = FileField('Profile Picture', validators=[
        FileAllowed(['jpg', 'jpeg', 'png', 'gif'], 'Only image files are allowed.')  # Specifies allowed file types
    ]) 
    employer=RadioField("Employer",choices=[("yes","Yes"),("no","No")])
    fullname=StringField("Fullname", validators=[DataRequired(),Length(min=2,max=20)])
    email=StringField("Email Address", validators=[DataRequired(),Email()])
    password = PasswordField('Password',validators=[DataRequired(),Length(min=6)])
    confirm_password = PasswordField('Confirm Password', validators=[DataRequired(),EqualTo('password')])
    submit = SubmitField('Sign Up')

class TweetForm(FlaskForm):
    content = TextAreaField('Content', validators=[])
    image = FileField('Image')

class LoginForm(FlaskForm):
    email=StringField("Email Address", validators=[DataRequired(),Email()])
    # password = PasswordField('Password',validators=[DataRequired(),Length(min=6)])
    submit = SubmitField('Continue')

class PostForm(FlaskForm):
    content = TextAreaField()
    media = FileField('Media', validators=[
        FileAllowed(['jpg', 'jpeg', 'png', 'gif'], 'Only image files are allowed.')  # Specifies allowed file types
    ]) 
    submit = SubmitField('POST')

