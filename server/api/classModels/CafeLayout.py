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
from sqlalchemy import event

from extensions import db


class CafeLayout(db.Model):
    __tablename__ = 'cafelayout'

    id = db.Column(db.Integer, primary_key=True)
    
    # Foreign key linking to Cafe table
    cafe_id = db.Column(db.Integer, db.ForeignKey('cafes.id'), nullable=False)
    
    # Stores the original layout (e.g., default layout when cafe is created)
    model_layout_data = db.Column(db.JSON, nullable=True)
    
    # Stores the custom layout updated by the user
    cafe_layout_data = db.Column(db.JSON, nullable=True)
    
    # Timestamp for when model_layout_data was last updated
    model_layout_updated_at = db.Column(db.DateTime, nullable=True)
    
    # Timestamp for when cafe_layout_data was last updated
    cafe_layout_updated_at = db.Column(db.DateTime, nullable=True)
    
    # General timestamp for the record
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Define relationship to Cafe model
    cafe = db.relationship('Cafe', backref=db.backref('layouts', lazy=True))


    #update the layout data

    '''def update_layout_data(self, layout_data):
        """
        Update the cafe layout data with new layout information.
        
        :param layout_data: JSON data containing the updated layout.
        """
        self.cafe_layout_data = layout_data
        self.updated_at = datetime.utcnow()
        db.session.commit()'''
        
# Event listeners to automatically update timestamps when layout data changes
@event.listens_for(CafeLayout.model_layout_data, 'set')
def update_model_layout_timestamp(target, value, oldvalue, initiator):
    """Update model_layout_updated_at when model_layout_data changes"""
    if oldvalue != value:
        target.model_layout_updated_at = datetime.utcnow()

@event.listens_for(CafeLayout.cafe_layout_data, 'set')
def update_cafe_layout_timestamp(target, value, oldvalue, initiator):
    """Update cafe_layout_updated_at when cafe_layout_data changes"""
    if oldvalue != value:
        target.cafe_layout_updated_at = datetime.utcnow()
