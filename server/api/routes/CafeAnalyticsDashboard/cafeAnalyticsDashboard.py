from flask import Blueprint, request, jsonify
from extensions import db
from classModels.User import User
from classModels.Cafe import Cafe
from classModels.Location import Location
from sqlalchemy.exc import SQLAlchemyError
from flask_jwt_extended import jwt_required
from werkzeug.security import generate_password_hash
from flask_jwt_extended import get_jwt_identity

Cafe_analytics_dashboard = Blueprint('Cafe_analytics_dashboard', __name__)

@Cafe_analytics_dashboard.route('/analyticsDashboard/dailyOccupancyPrediction', methods=['POST'])
@jwt_required()
def get_daily_occupancy_prediction_data():
    try:
        # Get the current user's identity from JWT
        identity = get_jwt_identity()
        cafeDetails = User.query.get(identity)
        print(cafeDetails)

        # Fetch the cafe associated with the user
        cafe = Cafe.query.filter_by(owner_id=cafeDetails.id).first()
        if not cafe:
            return jsonify({"error": "Cafe not found"}), 404

        data = [
            {"time": "JAN", "count": 11},
            {"time": "FEB", "count": 8},
            {"time": "MAR", "count": 15},
            {"time": "APR", "count": 25},
            {"time": "MAY", "count": 35},
            {"time": "JUN", "count": 45},
            {"time": "JUL", "count": 30},
            {"time": "AUG", "count": 20},
            {"time": "SEP", "count": 15},
            {"time": "OCT", "count": 10},
            {"time": "NOV", "count": 5},
            {"time": "DEC", "count": 8}
        ]
        # return jsonify({"daily_prediction_data": data}), 200
        return jsonify(data), 200

    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500
    except Exception as e:
        return jsonify({"error": str(e)}), 500
