from website import create_app
# import subprocess
import logging
from flask_mail import Mail
from flask_debugtoolbar import DebugToolbarExtension
from flask import g, request
import os
from dotenv import load_dotenv
import time
from website.backend.APIs.sqLite import close_db

app = create_app()

load_dotenv()
# Configure logging settings
# logging.basicConfig(filename='app.log', level=logging.DEBUG)
logging.basicConfig( level=logging.DEBUG)

toolbar = DebugToolbarExtension(app)

app.config['MAIL_SERVER'] = os.getenv('MAIL_SERVER')
app.config['MAIL_PORT'] = int(os.getenv('MAIL_PORT'))
app.config['MAIL_USE_TLS'] = os.getenv('MAIL_USE_TLS') is not None
app.config['MAIL_USERNAME'] = os.getenv('MAIL_USERNAME')
app.config['MAIL_PASSWORD'] = os.getenv('MAIL_PASSWORD')
app.config['MAIL_DEFAULT_SENDER'] = os.getenv('MAIL_DEFAULT_SENDER')

mail = Mail(app)


@app.teardown_appcontext
def app_teardown(exception):
    close_db(exception)
# subprocess.run(["python", "website\APIs\insert_jobs.py"])
@app.before_request
def before_request():
    g.start_time = time.time()
    logging.info(f"Request started: {request.url}")

@app.after_request
def after_request(response):
    elapsed_time = time.time() - g.start_time
    logging.info(f"Request finished in {elapsed_time:.4f} seconds")
    return response

if __name__ =='__main__':
    app.run(host=os.getenv("HOST"),port=os.getenv("PORT"),debug=os.getenv("DEBUG"))

