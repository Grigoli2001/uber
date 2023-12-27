from ..APIs.email import send_email
import random
import schedule
import asyncio
import threading
import time
from flask import session

code_container = {}

def generate_4_digit_code():
    return random.randint(1000, 9999)

def send_2fa_email(email):
    code = generate_4_digit_code()
    # Save the code in the session for a maximum of 4 minutes
    code_container[email] = {'code': code, 'expiration_time': time.time() + 180}
    print("code is " + str(code_container[email]['code']))
    try:
        send_email("2FA Code", [email], "Your 2FA code is " + str(code))
        threading.Thread(target=clear_code_container).start()

    except Exception as e:
        print("This is the exception error of send_2fa_email function:", e)
        return False
    return True

def clear_code_container():
    print("code container:", code_container)
    time.sleep(240)
    print("clearing session")
    code_container.clear()
    print("code container after clearing:", code_container)
    

def verify_2fa(code):
    print("code container: in verify_2fa", code_container)
    print(session['email'] in code_container)
    
    if session['email'] in code_container:
        print(code_container[session['email']]['code'])
        if code_container[session['email']]['code'] == code:
            return True
    return False
