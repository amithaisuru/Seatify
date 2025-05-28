from flask import Blueprint, jsonify, request
from extensions import db
from classModels.Cafe import Cafe
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy.exc import SQLAlchemyError
from classModels.User import User
from classModels.Location import Location  # Assuming you have a Location model

cafeLayout_bp = Blueprint('cafeLayout', __name__)

@cafeLayout_bp.route('/cafeLayout', methods=['GET'])
@jwt_required()
def get_cafeLayout():
    try:
        # cafe = Cafe.query.get(cafe_id)
        # if not cafe:
        #     return jsonify({"error": "Cafe not found"}), 404

        # Hardcoded values for layout display
        tables = [
            { "x": 100, "y": 80, "label": "T1" },
            { "x": 300, "y": 80, "label": "T2" }
        ]

        chairs = [
            { "x": 80, "y": 60, "label": "C1", "status": "available" },
            { "x": 150, "y": 60, "label": "C2", "status": "occupied" },
            { "x": 80, "y": 120, "label": "C3", "status": "available" },
            { "x": 170, "y": 90, "label": "C13", "status": "available" },
            { "x": 160, "y": 130, "label": "C4", "status": "available" },
            { "x": 130, "y": 150, "label": "C5", "status": "occupied" },
            { "x": 280, "y": 60, "label": "C10", "status": "available" },
            { "x": 320, "y": 60, "label": "C6", "status": "occupied" },
            { "x": 360, "y": 80, "label": "C11", "status": "occupied" },
            { "x": 370, "y": 110, "label": "C9", "status": "occupied" },
            { "x": 280, "y": 120, "label": "C7", "status": "available" },
            { "x": 350, "y": 140, "label": "C8", "status": "available" },
            { "x": 310, "y": 140, "label": "C12", "status": "available" },
        ]

        # For demonstration, let's assume all seats are available

        return jsonify({
                    # "cafe_id": cafe_id,
                    "tables": tables,
                    "chairs": chairs
                }), 200

    except SQLAlchemyError as e:
        return jsonify({"error": "Database error", "message": str(e)}), 500

    except Exception as e:
        return jsonify({"error": "Unexpected error", "message": str(e)}), 500
