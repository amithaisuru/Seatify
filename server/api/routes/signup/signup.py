from flask import Blueprint, request, jsonify
from werkzeug.utils import secure_filename
from extensions import db
from classModels.User import User
from classModels.Cafe import Cafe
from classModels.Location import Location
from sqlalchemy.exc import SQLAlchemyError
from werkzeug.security import generate_password_hash
import os
from flask import current_app, send_from_directory
from flask import jsonify


signup_bp = Blueprint('signup', __name__)

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@signup_bp.route('/signup', methods=['POST'])
# def signup():
#     try:
#         data = request.get_json()
#         print("Received data:", data)  # Debug log

#         # Validate input
#         if not data or not data.get('email') or not data.get('password') or not data.get('user_type'):
#             return jsonify({"error": "Missing required fields (email, password, user_type)"}), 400

#         # Check if user already exists
#         existing_user = User.query.filter_by(email=data['email']).first()
#         if existing_user:
#             return jsonify({"error": "User already exists"}), 409  # 409 Conflict

#         # Hash the password before saving
#         hashed_password = generate_password_hash(data['password'])

#         # Create new user
#         new_user = User(
#             email=data['email'],
#             password=hashed_password,
#             user_type=data['user_type']
#         )

#         db.session.add(new_user)
#         db.session.commit()

#         # ✅ If user is a Cafe owner (user_type == 2), create a Cafe
#         if new_user.user_type == 2:
#             # Validate cafe fields
#             if not data.get('cafe_name') or not data.get('location') or not data.get('contact_number'):
#                 return jsonify({"error": "Missing cafe details (cafe_name, location, contact_number)"}), 400

#             new_cafe = Cafe(
#                 owner_id=new_user.id,
#                 cafe_name=data['cafe_name'],
#                 location_id=data['location'],
#                 contact_number=data['contact_number']
#             )

#             db.session.add(new_cafe)
#             db.session.commit()

#         return jsonify({"message": "User created successfully"}), 200

#     except SQLAlchemyError as e:
#         db.session.rollback()
#         return jsonify({"error": "Database error", "message": str(e)}), 500

#     except Exception as e:
#         return jsonify({"error": "Signup failed", "message": str(e)}), 500
def signup():
    try:
        if request.content_type.startswith('multipart/form-data'):
            data = request.form
            file = request.files.get('image')
        else:
            return jsonify({"error": "Unsupported content type"}), 415

        # Basic validation
        email = data.get('email')
        password = data.get('password')
        user_type = data.get('user_type')

        if not email or not password or not user_type:
            return jsonify({"error": "Missing required fields (email, password, user_type)"}), 400

        if User.query.filter_by(email=email).first():
            return jsonify({"error": "User already exists"}), 409

        hashed_password = generate_password_hash(password)
        new_user = User(email=email, password=hashed_password, user_type=user_type)
        db.session.add(new_user)
        db.session.commit()

        if str(user_type) == '2':
            cafe_name = data.get('cafe_name')
            location_id = data.get('location')
            contact_number = data.get('contact_number')

            if not cafe_name or not location_id or not contact_number:
                return jsonify({"error": "Missing cafe details"}), 400

            image_url = None

            if file and allowed_file(file.filename):
                filename = secure_filename(file.filename)
                cafe_folder = os.path.join(current_app.root_path, 'uploads', 'cafes', f"cafe_{email}")
                os.makedirs(cafe_folder, exist_ok=True)
                file_path = os.path.join(cafe_folder, filename)
                file.save(file_path)

                image_url = f"/uploads/cafes/cafe_{email}/{filename}"


            new_cafe = Cafe(
                owner_id=new_user.id,
                cafe_name=cafe_name,
                location_id=location_id,
                contact_number=contact_number,
                image_url=image_url
            )

            db.session.add(new_cafe)
            db.session.commit()

        return jsonify({"message": "User created successfully"}), 200

    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({"error": "Database error", "message": str(e)}), 500

    except Exception as e:
        return jsonify({"error": "Signup failed", "message": str(e)}), 500


# Static route to serve uploaded images
@signup_bp.route('/uploads/cafes/<cafe_id>/<filename>')
def serve_cafe_image(cafe_id, filename):
    folder = os.path.join(app.root_path, 'uploads', 'cafes', f"cafe_{cafe_id}")
    return send_from_directory(folder, filename)


@signup_bp.route('/locations',methods=['GET'])
def fetchLocations():
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
