from extensions import db
from datetime import datetime

class Cafe(db.Model):
    __tablename__ = 'cafes'  # Table name in your MySQL DB

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    owner_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    cafe_name = db.Column(db.String(255), nullable=False)
    location = db.Column(db.Text)
    contact_number = db.Column(db.String(20))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    location_id = db.Column(db.Integer, db.ForeignKey('locations.id'), nullable=True)
    image_url = db.Column(db.String(500))  # ✅ New field to store image path


    # Relationships
    owner = db.relationship('User', backref=db.backref('cafes', lazy=True))
    location = db.relationship('Location', backref=db.backref('cafes', lazy=True))

    def __repr__(self):
        return f"<Cafe {self.cafe_name}>"
