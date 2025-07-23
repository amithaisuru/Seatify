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

        tables = []
        available_seats_count = 0

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
                        print("Using model_layout_data (newer) with cafe status updates")
                        tables = layout.model_layout_data.get('tables', [])
                        # Update table statuses from cafe_layout_data
                        cafe_tables = layout.cafe_layout_data.get('tables', [])
                        tables = update_table_statuses(tables, cafe_tables)
                    else:
                        print("Using cafe_layout_data (newer)")
                        tables = layout.cafe_layout_data.get('tables', [])
                elif cafe_timestamp:
                    # Only cafe timestamp exists
                    print("Using cafe_layout_data (only cafe timestamp exists)")
                    tables = layout.cafe_layout_data.get('tables', [])
                elif model_timestamp:
                    # Only model timestamp exists
                    print("Using model_layout_data (only model timestamp exists) with default status")
                    tables = layout.model_layout_data.get('tables', [])
                    # Set default status for all tables since no cafe data exists
                    for table in tables:
                        if 'status' not in table:
                            table['status'] = 'available'
                else:
                    # No timestamps, default to cafe_layout_data
                    print("Using cafe_layout_data (no timestamps)")
                    tables = layout.cafe_layout_data.get('tables', [])
            elif layout.cafe_layout_data:
                print("Using cafe_layout_data (only cafe data exists)")
                tables = layout.cafe_layout_data.get('tables', [])
            elif layout.model_layout_data:
                print("Using model_layout_data (only model data exists) with default status")
                tables = layout.model_layout_data.get('tables', [])
                # Set default status for all tables since no cafe data exists
                for table in tables:
                    if 'status' not in table:
                        table['status'] = 'available'
                
            # Calculate available seats count
            available_seats_count = calculate_available_seats(tables)
                
        else:
            return jsonify({"error": "Layout not found"}), 404

        print("available_seats_count:", available_seats_count)
        return jsonify({
            "cafe_id": cafe_id,
            "tables": tables,
            "available_seats_count": available_seats_count
        }), 200

    except SQLAlchemyError as e:
        return jsonify({"error": "Database error", "message": str(e)}), 500

    except Exception as e:
        return jsonify({"error": "Unexpected error", "message": str(e)}), 500


def update_table_statuses(model_tables, cafe_tables):
    """
    Update table statuses in model_tables based on cafe_tables
    """
    # Create a mapping of table_id to status from cafe_tables
    cafe_status_map = {}
    for cafe_table in cafe_tables:
        table_id = cafe_table.get('table_id')
        status = cafe_table.get('status', 'available')
        if table_id:
            cafe_status_map[table_id] = status
    
    # Update model_tables with statuses from cafe_tables
    updated_tables = []
    for model_table in model_tables:
        table_copy = model_table.copy()
        table_id = table_copy.get('table_id')
        
        if table_id in cafe_status_map:
            # Use status from cafe_layout_data
            table_copy['status'] = cafe_status_map[table_id]
        else:
            # Default status if not found in cafe data
            table_copy['status'] = 'available'
            
        updated_tables.append(table_copy)
    
    return updated_tables

def calculate_available_seats(tables):
    """
    Calculate the total number of available seats across all tables
    """
    available_count = 0
    print('tables:', tables)
    for table in tables:
        # Only count seats from tables that are available
        if table.get('status') == 'available':
            chair_count = table.get('chair_count', 0)
            seated_persons_count = table.get('seated_persons_count', 0)
            # Available seats = total chairs - seated persons
            table_available_seats = chair_count - seated_persons_count
            available_count += table_available_seats
            print(f"Table {table.get('tabel_id')}: {chair_count} chairs, {seated_persons_count} seated, {table_available_seats} available")
    
    return available_count