# import mail
from ....main import mail
from flask_mail import Message

def send_email(subject, recipients, text_body, sender = "noreply@uberproject.com", html_body = None):
    msg = Message(subject, sender=sender, recipients=recipients)
    msg.body = text_body
    msg.html = html_body
    mail.send(msg)