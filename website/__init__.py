from flask import Flask
import os
from dotenv import load_dotenv
from flask_login import LoginManager
load_dotenv()
login_manager = LoginManager()
def create_app():
    app = Flask(__name__)
    app.config['SECRET_KEY'] = os.getenv("SECRET_KEY")
    app.config['UPLOAD_FOLDER'] = os.path.join(app.root_path, 'static', 'uploads')
    # Initialize the LoginManager
    login_manager.login_view = 'login_blueprint.login_logic'  # Set the login view
    login_manager.init_app(app)

#user Blueprints
    from .backend.user.user_root import root
    from .backend.user.user_register import register
    from website.backend.user.user_login import login_blueprint
    app.register_blueprint(root,url_prefix='/')
    app.register_blueprint(register,url_prefix='/register')
    app.register_blueprint(login_blueprint,url_prefix='/login')

#driver Blueprints

    # from .backend.driver.driver_root import driver_root
    # from .backend.driver.driver_register import driver_register
    # from .backend.driver.driver_login import driver_login
    # app.register_blueprint(driver_root,url_prefix='/driver')
    # app.register_blueprint(driver_register,url_prefix='/driver_register')
    # app.register_blueprint(driver_login,url_prefix='/driver_login')

#admin Blueprints

    # from .backend.admin.admin_root import admin_root
    # from .backend.admin.admin_login import admin_login
    # app.register_blueprint(admin_root,url_prefix='/admin')
    # app.register_blueprint(admin_login,url_prefix='/admin_login')

    return app


