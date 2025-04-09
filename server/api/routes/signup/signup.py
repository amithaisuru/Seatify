from flask import Blueprint, request, jsonify
from extensions import db
from classModels.User import User
from classModels.Cafe import Cafe
from classModels.Location import Location
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

        # ✅ If user is a Cafe owner (user_type == 2), create a Cafe
        if new_user.user_type == 2:
            # Validate cafe fields
            if not data.get('cafe_name') or not data.get('location') or not data.get('contact_number'):
                return jsonify({"error": "Missing cafe details (cafe_name, location, contact_number)"}), 400

            new_cafe = Cafe(
                owner_id=new_user.id,
                cafe_name=data['cafe_name'],
                location_id=data['location'],
                contact_number=data['contact_number']
            )

            db.session.add(new_cafe)
            db.session.commit()

        return jsonify({"message": "User created successfully"}), 200

    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({"error": "Database error", "message": str(e)}), 500

    except Exception as e:
        return jsonify({"error": "Signup failed", "message": str(e)}), 500

@signup_bp.route('/locations',methods=['GET'])
def fetchLocations():
    try:
        locations=Location.query.all()
        # Format the data
        location_list = [
            {
                "id": location.id,
                "location": location.location
            }
            for location in locations
        ]

        return jsonify({'locations':location_list}),200

    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({"error": "Database error", "message": str(e)}), 500
    except Exception as e:
        return jsonify({"error": "Failed to fetch locations", "message": str(e)}), 500
