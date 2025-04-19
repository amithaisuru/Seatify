from flask import Blueprint, request, jsonify
from extensions import db
from classModels.User import User
from classModels.Cafe import Cafe
from classModels.Location import Location
from sqlalchemy.exc import SQLAlchemyError
from flask_jwt_extended import jwt_required
from werkzeug.security import generate_password_hash

admin_users_profiles = Blueprint('admin_users_profiles', __name__)

@admin_users_profiles.route('/admin/addUsers', methods=['POST'])
@jwt_required()
def register_by_admin():
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

@admin_users_profiles.route('/admin/locations',methods=['GET'])
@jwt_required()
def admin_page_fetchLocations():
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

@admin_users_profiles.route('/admin/getUsers', methods=['GET'])
@jwt_required()
def get_users():
    try:
        users = User.query.all()
        # print('users',users)  # Debug log
        
        Customer_users = [
            {
                "id": user.id,
                "email": user.email,
                "user_type": user.user_type
            }
            for user in users
            if user.user_type == 1]
        
        # print('Customer_users',Customer_users)  # Debug log
        
        # Cafe_users = [
        #     {
        #         "id": user.id,
        #         "email": user.email,
        #         "user_type": user.user_type,
                
        #     }
        #     for user in users
        #     if user.user_type == 2]

        cafes=Cafe.query.all()
        # print('cafes',cafes)  # Debug log
        Cafe_users=[
            {
                'id':cafe.id,
                'email': cafe.owner.email if cafe.owner else None,
                'cafe_name':cafe.cafe_name,
                'location' : cafe.location.location if cafe.location else None,
                'contact_number': cafe.contact_number
            }
            for cafe in cafes]
        
        Admin_users = [
            {
                "id": user.id,
                "email": user.email,
                "user_type": user.user_type
            }
            for user in users
            if user.user_type == 3
        ]


        print('Cafe_users',Cafe_users)  # Debug log

        return jsonify({"customer_users": Customer_users, "cafe_users":Cafe_users,"admin_users":Admin_users}), 200

    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({"error": "Database error", "message": str(e)}), 500

    except Exception as e:
        return jsonify({"error": "Failed to fetch users", "message": str(e)}), 500

@admin_users_profiles.route('/admin/deleteUser', methods=['POST'])
@jwt_required()
def delete_users():
    try:
        data = request.get_json()
        print("Received data:", data)  # Debug log
        email = data.get('email')

        # Validate input
        if not data or not email:
            return jsonify({"error": "Missing required field email"}), 400

        # # Find related cafe
        # cafe = Cafe.query.filter_by(=id).first()
        # if cafe:
        #     db.session.delete(cafe)

        # Find the user by ID
        user = User.query.filter_by(email=email).first()
        if not user:
            return jsonify({"error": "User not found"}), 404  # 404 Not Found
        
        # Delete associated Cafe if user is an owner
        if user.user_type == 2:
            cafe = Cafe.query.filter_by(owner_id=user.id).first()
            if cafe:
                db.session.delete(cafe)
        # Delete the user
        db.session.delete(user)
        db.session.commit()

        return jsonify({"message": "User deleted successfully"}), 200
    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({"error": "Database error", "message": str(e)}), 500
    except Exception as e:
        return jsonify({"error": "Failed to delete user", "message": str(e)}), 500
    
        