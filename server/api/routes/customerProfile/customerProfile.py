from flask import Blueprint, jsonify
from extensions import db
from classModels.Cafe import Cafe
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy.exc import SQLAlchemyError
from classModels.User import User  

customerProfile_bp = Blueprint('customerProfile', __name__)

@customerProfile_bp.route('/customerProfileDetails', methods=['GET'])
@jwt_required()
def get_customer_profile_data():
    try:
        # ✅ Get the current user's identity from JWT
        identity = get_jwt_identity()
        user = User.query.get(identity)
        if not user:
            return jsonify({"error": "User not found"}), 404

        # Customize based on your user model
        user_data = {
            "id": user.id,
            "email": user.email,
            "user_type": user.user_type,
            # Add more fields as needed
        }

        return jsonify({"customerProfileData": user_data}), 200

    except SQLAlchemyError as e:
        return jsonify({"error": "Database error", "message": str(e)}), 500

    except Exception as e:
        return jsonify({"error": "Unexpected error", "message": str(e)}), 500

@customerProfile_bp.route('/updateProfile', methods=['POST'])
@jwt_required()
def update_customer_profile():
    try:
        identity = get_jwt_identity()
        user = User.query.get(identity)

        data = request.get_json()
        user.email = data.get("email", user.email)

        db.session.commit()
        return jsonify({"message": "Customer Profile updated"}), 200

    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({"error": "DB error", "message": str(e)}), 500
    except Exception as e:
            return jsonify({"error": "Unexpected error", "message": str(e)}), 500

