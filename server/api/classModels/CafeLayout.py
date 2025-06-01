# from extensions import db
# from datetime import datetime

# class CafeLayout(db.Model):
#     __tablename__ = 'cafelayout'

#     id = db.Column(db.Integer, primary_key=True)
#     cafe_id = db.Column(db.Integer, db.ForeignKey('cafe.id'))
#     original_layout_data = db.Column(db.JSON)
#     custom_layout_data = db.Column(db.JSON)
#     updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
#     cafe = db.relationship('Cafe', backref=db.backref('layout', lazy=True))

from extensions import db
from datetime import datetime

class CafeLayout(db.Model):
    __tablename__ = 'cafelayout'

    id = db.Column(db.Integer, primary_key=True)
    
    # Foreign key linking to Cafe table
    cafe_id = db.Column(db.Integer, db.ForeignKey('cafes.id'), nullable=False)
    
    # Stores the original layout (e.g., default layout when cafe is created)
    model_layout_data = db.Column(db.JSON, nullable=True)
    
    # Stores the custom layout updated by the user
    cafe_layout_data = db.Column(db.JSON, nullable=True)
    
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Define relationship to Cafe model
    cafe = db.relationship('Cafe', backref=db.backref('layouts', lazy=True))
