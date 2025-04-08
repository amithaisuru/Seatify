from flask import Blueprint, request, jsonify
from extensions import db
from classModels.User import User
from flask_jwt_extended import create_access_token
from sqlalchemy.exc import SQLAlchemyError
from werkzeug.security import generate_password_hash

signup_bp = Blueprint('signup', __name__)

@signup_bp.route('/signup', methods=['POST'])
def signup():
    try:
        data = request.get_json()
        print("Received data:", data)  # Debug log

        # Validate input
        if not data or not data.get('email') or not data.get('password') or not data.get('user_type'):
            return jsonify({"error": "Missing required fields (email, password, user_type)"}), 400

        # Check if user already exists
        existing_user = User.query.filter_by(email=data['email']).first()
        if existing_user:
            return jsonify({"error": "User already exists"}), 409  # 409 Conflict

        # Hash the password before saving
        hashed_password = generate_password_hash(data['password'])

        # Create new user
        new_user = User(
            email=data['email'],
            password=hashed_password,
            user_type=data['user_type']
        )

        db.session.add(new_user)
        db.session.commit()

        return jsonify({"message": "User created successfully"}), 200

    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({"error": "Database error", "message": str(e)}), 500

    except Exception as e:
        return jsonify({"error": "Signup failed", "message": str(e)}), 500