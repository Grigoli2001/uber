# import mail
from main import mail
from flask_mail import Message



def send_email(subject, recipients, text_body, sender = "noreply@uberproject.com", html_body = None):
    try:
        msg = Message(subject, sender=sender, recipients=recipients)
        msg.body = text_body
        msg.html = html_body
        mail.send(msg)
        print("email sent successfully")
        return True
    except Exception as e:
        print("This is the exception error of send_email function"+e)
        return False
    
    