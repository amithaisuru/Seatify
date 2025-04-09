from flask import Flask
from config import Config
from extensions import db, jwt, cors
from routes.signup.signup import signup_bp
from routes.authentication.login import login_bp
from routes.customerHomepage.customerHomepage import cafes_bp
# from routes.profile.profile import profile_bp

def create_app():
    app = Flask(__name__)
    # This loads JWT_SECRET_KEY into Flask
    app.config.from_object(Config)

    # Initialize extensions
    db.init_app(app)
    jwt.init_app(app)
    cors.init_app(app, resources={r"/*": {"origins": "*"}})  # Add this line for CORS!


    # Register blueprints
    app.register_blueprint(signup_bp)
    app.register_blueprint(login_bp)
    # app.register_blueprint(profile_bp)
    app.register_blueprint(cafes_bp)

    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True)
