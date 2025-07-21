from classModels.Cafe import Cafe
from classModels.CafeLayout import CafeLayout
from extensions import db
from flask import Blueprint, jsonify
from flask_jwt_extended import get_jwt_identity, jwt_required
from sqlalchemy.exc import SQLAlchemyError
from classModels.CafeLayout import CafeLayout

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
                "seats_available": 10 if cafe.cafe_name == 'Hot Wok' else 0,
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

# Get cafe information by ID
@cafes_bp.route('/cafes/<int:cafe_id>/info', methods=['GET'])
@jwt_required()
def get_cafe_by_id(cafe_id):
    try:
        cafe = Cafe.query.get(cafe_id)
        if not cafe:
            return jsonify({"error": "Cafe not found"}), 404

        cafe_data = {
            "id": cafe.id,
            "cafe_name": cafe.cafe_name,
            "contact_number": cafe.contact_number,
            "seats_available": 10,  # You can later make this dynamic
            "location": {
                "id": cafe.location.id if cafe.location else None,
                "name": cafe.location.location if cafe.location else "Unknown"
            }
        }

        return jsonify({"cafe": cafe_data}), 200

    except SQLAlchemyError as e:
        return jsonify({"error": "Database error", "message": str(e)}), 500

    except Exception as e:
        return jsonify({"error": "Unexpected error", "message": str(e)}), 500

# fetch layout details from db
@cafes_bp.route('/cafes/<int:cafe_id>/layout', methods=['GET'])
@jwt_required()
def get_seats_by_cafe_id(cafe_id):
    try:
        cafe = Cafe.query.get(cafe_id)
        if not cafe:
            return jsonify({"error": "Cafe not found"}), 404

        # Hardcoded values for layout display
        # tables = [
        #     { "x": 100, "y": 80, "label": "T1" },
        #     { "x": 300, "y": 80, "label": "T2" }
        # ]

        # chairs = [
        #     { "x": 80, "y": 60, "label": "C1", "status": "available" },
        #     { "x": 150, "y": 60, "label": "C2", "status": "occupied" },
        #     { "x": 80, "y": 120, "label": "C3", "status": "available" },
        #     { "x": 170, "y": 90, "label": "C13", "status": "available" },
        #     { "x": 160, "y": 130, "label": "C4", "status": "available" },
        #     { "x": 130, "y": 150, "label": "C5", "status": "occupied" },
        #     { "x": 280, "y": 60, "label": "C10", "status": "available" },
        #     { "x": 320, "y": 60, "label": "C6", "status": "occupied" },
        #     { "x": 360, "y": 80, "label": "C11", "status": "occupied" },
        #     { "x": 370, "y": 110, "label": "C9", "status": "occupied" },
        #     { "x": 280, "y": 120, "label": "C7", "status": "available" },
        #     { "x": 350, "y": 140, "label": "C8", "status": "available" },
        #     { "x": 310, "y": 140, "label": "C12", "status": "available" },
        # ]

        tables=[]
        # chairs=[]

        # Fetch layout from the database
        layout = CafeLayout.query.filter_by(cafe_id=cafe.id).first()
        if layout:
            # Debug: Print timestamp values
            print(f"cafe_layout_updated_at: {layout.cafe_layout_updated_at}")
            print(f"model_layout_updated_at: {layout.model_layout_updated_at}")
            
            if layout.cafe_layout_data and layout.model_layout_data:
                # Compare timestamps and take the latest one
                # Handle case where timestamps might be None
                cafe_timestamp = layout.cafe_layout_updated_at
                model_timestamp = layout.model_layout_updated_at
                
                if cafe_timestamp and model_timestamp:
                    # Both timestamps exist, compare them
                    if cafe_timestamp < model_timestamp:
                        print("Using cafe_layout_data (newer)")
                        tables = layout.cafe_layout_data.get('tables', [])
                        # chairs = layout.cafe_layout_data.get('chairs', [])
                    else:
                        print("Using model_layout_data (newer)")
                        tables = layout.model_layout_data.get('tables', [])
                        # chairs = layout.model_layout_data.get('chairs', [])
                elif cafe_timestamp:
                    # Only cafe timestamp exists
                    print("Using cafe_layout_data (only cafe timestamp exists)")
                    tables = layout.cafe_layout_data.get('tables', [])
                    # chairs = layout.cafe_layout_data.get('chairs', [])
                elif model_timestamp:
                    # Only model timestamp exists
                    print("Using model_layout_data (only model timestamp exists)")
                    tables = layout.model_layout_data.get('tables', [])
                    # chairs = layout.model_layout_data.get('chairs', [])
                else:
                    # No timestamps, default to cafe_layout_data
                    print("Using cafe_layout_data (no timestamps)")
                    tables = layout.cafe_layout_data.get('tables', [])
                    # chairs = layout.cafe_layout_data.get('chairs', [])
            elif layout.cafe_layout_data:
                print("Using cafe_layout_data (only cafe data exists)")
                tables = layout.cafe_layout_data.get('tables', [])
                # chairs = layout.cafe_layout_data.get('chairs', [])
            elif layout.model_layout_data:
                print("Using model_layout_data (only model data exists)")
                tables = layout.model_layout_data.get('tables', [])
                # chairs = layout.model_layout_data.get('chairs', [])
                
        else:
            return jsonify({"error": "Layout not found"}), 404

        return jsonify({
                    "cafe_id": cafe_id,
                    "tables": tables,
                    # "chairs": chairs
                }), 200

    except SQLAlchemyError as e:
        return jsonify({"error": "Database error", "message": str(e)}), 500

    except Exception as e:
        return jsonify({"error": "Unexpected error", "message": str(e)}), 500