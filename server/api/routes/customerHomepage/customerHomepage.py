from flask import Blueprint, jsonify
from extensions import db
from classModels.Cafe import Cafe
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy.exc import SQLAlchemyError

cafes_bp = Blueprint('cafes', __name__)

@cafes_bp.route('/cafes', methods=['GET'])
@jwt_required()
def get_cafes():
    try:
        cafes = Cafe.query.all()
        cafe_list = [
            {
                "id": cafe.id,
                "cafe_name": cafe.cafe_name,
                "seats_available": 10,  # You can later make this dynamic
                "location": {
                    "id": cafe.location.id if cafe.location else None,
                    "name": cafe.location.location if cafe.location else "Unknown"
                }
            }
            for cafe in cafes
        ]

        return jsonify({"cafes": cafe_list}), 200

    except SQLAlchemyError as e:
        return jsonify({"error": "Database error", "message": str(e)}), 500

    except Exception as e:
        return jsonify({"error": "Unexpected error", "message": str(e)}), 500
