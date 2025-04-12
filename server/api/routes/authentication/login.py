from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token
from classModels.User import User
from datetime import timedelta
from extensions import db
from sqlalchemy.exc import SQLAlchemyError
from werkzeug.security import check_password_hash

login_bp = Blueprint('login', __name__)

@login_bp.route('/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        if not data or not data.get('email') or not data.get('password'):
            return jsonify({"error": "Missing email or password"}), 400

        user = User.query.filter_by(email=data['email']).first()

        if not user or not check_password_hash(user.password, data['password']):
            return jsonify({"error": "Invalid email or password"}), 401
        
        access_token = create_access_token(
            identity=str(user.id),
            additional_claims={"user_type": user.user_type},
            expires_delta=timedelta(seconds=36000) 
        )

        return jsonify({
            "access_token": access_token,
            "message": "User Login successfully"
        }), 200

    
    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({"error": "Database error", "message": str(e)}), 500

    except Exception as e:
        print("Login error:", str(e))  # Debug log
        return jsonify({"error": "Login failed", "message": str(e)}), 500