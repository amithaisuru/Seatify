# cafe owner side
from flask import Blueprint, jsonify, request
from extensions import db
from classModels.Cafe import Cafe
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy.exc import SQLAlchemyError
from classModels.User import User
from classModels.Location import Location
from classModels.CafeLayout import CafeLayout

cafeLayout_bp = Blueprint('cafeLayout', __name__)

# Get cafe layout information
@cafeLayout_bp.route('/cafeLayout', methods=['GET'])
@jwt_required()
def get_cafeLayout():
    try:
        cafe_id = get_jwt_identity()
        print("Cafe ID:", cafe_id)
        # get cafe where owner_id=cafe_id
        cafe = Cafe.query.filter_by(owner_id=cafe_id).first()
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
        chairs=[]

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
                        chairs = layout.cafe_layout_data.get('chairs', [])
                    else:
                        print("Using model_layout_data (newer)")
                        tables = layout.model_layout_data.get('tables', [])
                        chairs = layout.model_layout_data.get('chairs', [])
                elif cafe_timestamp:
                    # Only cafe timestamp exists
                    print("Using cafe_layout_data (only cafe timestamp exists)")
                    tables = layout.cafe_layout_data.get('tables', [])
                    chairs = layout.cafe_layout_data.get('chairs', [])
                elif model_timestamp:
                    # Only model timestamp exists
                    print("Using model_layout_data (only model timestamp exists)")
                    tables = layout.model_layout_data.get('tables', [])
                    chairs = layout.model_layout_data.get('chairs', [])
                else:
                    # No timestamps, default to cafe_layout_data
                    print("Using cafe_layout_data (no timestamps)")
                    tables = layout.cafe_layout_data.get('tables', [])
                    chairs = layout.cafe_layout_data.get('chairs', [])
            elif layout.cafe_layout_data:
                print("Using cafe_layout_data (only cafe data exists)")
                tables = layout.cafe_layout_data.get('tables', [])
                chairs = layout.cafe_layout_data.get('chairs', [])
            elif layout.model_layout_data:
                print("Using model_layout_data (only model data exists)")
                tables = layout.model_layout_data.get('tables', [])
                chairs = layout.model_layout_data.get('chairs', [])
                
        else:
            return jsonify({"error": "Layout not found"}), 404
        # print("Tables:", tables)
        # print("Chairs:", chairs)

        return jsonify({
                    # "cafe_id": cafe_id,
                    "tables": tables,
                    "chairs": chairs
                }), 200

    except SQLAlchemyError as e:
        return jsonify({"error": "Database error", "message": str(e)}), 500

    except Exception as e:
        return jsonify({"error": "Unexpected error", "message": str(e)}), 500

# Save cafe layout information
@cafeLayout_bp.route('/cafeLayoutUpdate', methods=['POST'])
@jwt_required()
def save_layout():
    try:
        user_id = get_jwt_identity()
        data = request.get_json()

        tables = data.get('tables', [])
        chairs = data.get('chairs', [])

        print('tables', tables)
        print('chairs', chairs)

        if not tables or not chairs:
            return jsonify({"error": "Missing layout data"}), 400

        # ✅ Get the Cafe for this user
        cafe = Cafe.query.filter_by(owner_id=user_id).first()
        print('cafe', cafe)
        if not cafe:
            return jsonify({"error": "Cafe not found for user"}), 404

        # ✅ Check if a layout already exists
        layout = CafeLayout.query.filter_by(cafe_id=cafe.id).first()
        print('layout', layout)

        if layout:
            # Update existing layout
            layout.cafe_layout_data = {
                "tables": tables,
                "chairs": chairs
            }
        else:
            # Create a new layout record - don't set model_layout_data unless needed
            layout = CafeLayout(
                cafe_id=cafe.id,
                # model_layout_data will remain None/NULL, which won't trigger the event
                cafe_layout_data={
                    "tables": tables,
                    "chairs": chairs
                }
            )
            db.session.add(layout)

        db.session.commit()

        return jsonify({"message": "Layout saved successfully!"}), 200

    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({"error": "Database error", "details": str(e)}), 500

    except Exception as e:
        return jsonify({"error": "Unexpected error", "details": str(e)}), 500