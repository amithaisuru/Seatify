from flask import Blueprint, jsonify, request
from extensions import db
from classModels.Cafe import Cafe
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy.exc import SQLAlchemyError
from classModels.User import User
from classModels.Location import Location  # Assuming you have a Location model

cafeProfileDetails_bp = Blueprint('cafeProfileDetails', __name__)

@cafeProfileDetails_bp.route('/cafeProfileDetails', methods=['GET'])
@jwt_required()
def get_cafe_profile_data():
    try:
        # Get the current user's identity from JWT
        identity = get_jwt_identity()
        user = User.query.get(identity)
        if not user:
            return jsonify({"error": "Cafe not found"}), 404

        # Fetch the cafe associated with the user
        cafe = Cafe.query.filter_by(owner_id=user.id).first()
        if not cafe:
            return jsonify({"error": "Cafe not found"}), 404

        # Customize based on your cafe model
        cafe_data = {
            "id": cafe.id,
            "cafe_name": cafe.cafe_name,
             "location": {
                            "id": cafe.location.id if cafe.location else None,
                            "name": cafe.location.location if cafe.location else "Unknown"
                        },
            "contact_number": cafe.contact_number,
            "email":user.email,
            # "description": cafe.description,
            # Add more fields as needed
        }

        return jsonify({"cafeProfileData": cafe_data}), 200

    except SQLAlchemyError as e:
        return jsonify({"error": "Database error", "message": str(e)}), 500

    except Exception as e:
        return jsonify({"error": "Unexpected error", "message": str(e)}), 500

@cafeProfileDetails_bp.route('/updateCafeProfile', methods=['POST'])
@jwt_required()
def update_cafe_profile():
    try:
        identity = get_jwt_identity()
        user = User.query.get(identity)

        if not user:
            return jsonify({"error": "User not found"}), 404

        cafe = Cafe.query.filter_by(owner_id=user.id).first()
        if not cafe:
            return jsonify({"error": "Cafe not found"}), 404

        data = request.get_json()
        # print(data)
        cafe.cafe_name = data.get("cafe_name", cafe.cafe_name)
        cafe.contact_number = data.get("contact_number", cafe.contact_number)
        user.email = data.get("email", user.email)
    

        db.session.commit()
        return jsonify({"message": "Cafe Profile updated"}), 200

    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({"error": "DB error", "message": str(e)}), 500
    except Exception as e:
        return jsonify({"error": "Unexpected error", "message": str(e)}), 500
    