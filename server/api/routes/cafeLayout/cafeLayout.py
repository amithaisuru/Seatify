# cafe owner side
import datetime
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
        tables = []
        
        # Fetch layout from the database
        layout = CafeLayout.query.filter_by(cafe_id=cafe.id).first()
        if layout:
            # Extract timestamps from within the JSON data
            cafe_timestamp = None
            model_timestamp = None
            
            if layout.cafe_layout_data:
                cafe_timestamp_str = layout.cafe_layout_data.get('timestamp')
                if cafe_timestamp_str:
                    try:
                        cafe_timestamp = datetime.datetime.fromisoformat(cafe_timestamp_str)
                    except ValueError:
                        cafe_timestamp = None
            
            if layout.model_layout_data:
                model_timestamp_str = layout.model_layout_data.get('timestamp')
                if model_timestamp_str:
                    try:
                        model_timestamp = datetime.datetime.fromisoformat(model_timestamp_str)
                    except ValueError:
                        model_timestamp = None
            
            # Debug: Print timestamp values
            print(f"cafe_layout_timestamp: {cafe_timestamp}")
            print(f"model_layout_timestamp: {model_timestamp}")
            
            if layout.cafe_layout_data and layout.model_layout_data:
                # Compare timestamps and take the latest one
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
                
        else:
            return jsonify({"error": "Layout not found"}), 404

        # then check whether any of table_id in tables is match with ids in "reserved_table_ids" in table. if so then check the the "expired_time" is greater than current time, if so then set status="reserved" else set status="available corresponding tables in tables(which is going to return)

        if layout.reserved_table_ids:
            reserved_table_ids = layout.reserved_table_ids.get('reserved_table_ids', [])
            expired_time = layout.reserved_table_ids.get('expired_time')
            if expired_time:
                try:
                    expired_time = datetime.datetime.fromisoformat(expired_time)
                except ValueError:
                    expired_time = None
            
            current_time = datetime.datetime.now()
            print("Current time:", current_time)
            print("expired_time:", expired_time)
            # print("tables before update: ",tables)
            for table in tables:
                if table.get('tabel_id') in reserved_table_ids:
                    print(f"Table {table.get('tabel_id')} is in reserved list")
                    print(f"expired_time: {expired_time}, type: {type(expired_time)}")
                    print(f"current_time: {current_time}, type: {type(current_time)}")
                    
                    if expired_time is not None and current_time < expired_time:
                        print("00000000000000000000000000 current time< expired_time")
                        table['status'] = 'reserved'
                        print("table",table)
                    else:
                        print("00000000000000000000000000 current time >= expired_time OR expired_time is None")
                        table['status'] = 'available'
                        print("table",table)
                        # update reserved_table_ids to None
                        layout.reserved_table_ids = {
                            "reserved_table_ids": "",
                            "expired_time": ""
                        }
                        # commit the changes
                        db.session.commit()
                        

            print("Updated table statuses:", tables)

        return jsonify({
                    "tables": tables,
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


# Save cafe layout information
@cafeLayout_bp.route('/cafeLayoutUpdate', methods=['POST'])
@jwt_required()
def save_layout():
    try:
        user_id = get_jwt_identity()
        data = request.get_json()

        tables = data.get('tables', [])
        # chairs = data.get('chairs', [])

        # print('tables', tables)

        

        if not tables:
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
                "timestamp": datetime.datetime.now().isoformat()
            }

            # get table ids where status="reserved" from tables
            reserved_table_ids = [table.get('tabel_id') for table in tables if table.get('status') == 'reserved'] 

            layout.reserved_table_ids = {
                "reserved_table_ids": reserved_table_ids,
            # expire after 2 mins
                "expired_time": (datetime.datetime.now() + datetime.timedelta(minutes=2)).isoformat()
            }

            print('reserved_table_ids', reserved_table_ids)
        else:
            # Create a new layout record - don't set model_layout_data unless needed
            layout = CafeLayout(
                cafe_id=cafe.id,
                # model_layout_data will remain None/NULL, which won't trigger the event
                cafe_layout_data={
                    "tables": tables,
                    "timestamp": datetime.datetime.now().isoformat()
                }
            )
            db.session.add(layout)

        db.session.commit()

        return jsonify({
            "message": "Layout saved successfully!",
            # "available_chairs": available_chairs
        }), 200

    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({"error": "Database error", "details": str(e)}), 500

    except Exception as e:
        return jsonify({"error": "Unexpected error", "details": str(e)}), 500