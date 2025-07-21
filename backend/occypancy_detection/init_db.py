import os
from datetime import datetime
from urllib.parse import quote_plus

from dotenv import load_dotenv
from sqlalchemy import Column, DateTime, ForeignKey, Integer, create_engine, event
from sqlalchemy.dialects.mysql import JSON  # Change to MySQL JSON type
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship, sessionmaker

# Load environment variables
load_dotenv()

# Database configuration
DB_USER = os.getenv('DB_USER')
DB_PASSWORD = quote_plus(os.getenv('DB_PASSWORD') or '')
DB_HOST = os.getenv('DB_HOST')
DB_NAME = os.getenv('DB_NAME')
DATABASE_URI = f'mysql+pymysql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}/{DB_NAME}?charset=utf8mb4'

# Create SQLAlchemy engine and session
engine = create_engine(DATABASE_URI, echo=False)
Base = declarative_base()
Session = sessionmaker(bind=engine)

# Define CafeLayout model
class CafeLayoutDbModel(Base):
    __tablename__ = 'cafelayout'

    id = Column(Integer, primary_key=True)
    cafe_id = Column(Integer, ForeignKey('cafes.id'), nullable=False)
    model_layout_data = Column(JSON, nullable=False)  # Changed from JSONB to JSON
    model_layout_updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationship to Cafe model (optional, included for completeness)
    cafe = relationship('Cafe', backref='layouts')

    def update_layout_data(self, layout_data, cafe_id):
        """
        Update the cafe layout data for a specific cafe_id.

        :param layout_data: JSON data containing the updated layout.
        :param cafe_id: Integer ID of the cafe to update the layout for.
        :raises ValueError: If layout_data is not valid JSON or is None.
        :raises ValueError: If no CafeLayout record exists for the given cafe_id.
        :raises Exception: If database commit fails.
        """
        if layout_data is None:
            raise ValueError("layout_data cannot be None")
        try:
            import json
            json.dumps(layout_data)  # Validate JSON serializability
            session = Session()
            cafe_layout = session.query(CafeLayoutDbModel).filter_by(cafe_id=cafe_id).first()
            if not cafe_layout:
                session.close()
                raise ValueError(f"No CafeLayout found for cafe_id {cafe_id}")
            cafe_layout.model_layout_data = layout_data
            cafe_layout.updated_at = datetime.utcnow()
            session.add(cafe_layout)
            session.commit()
            session.close()
        except (TypeError, ValueError) as e:
            session.rollback()
            session.close()
            raise ValueError(f"Invalid layout data: {str(e)}")
        except Exception as e:
            session.rollback()
            session.close()
            raise Exception(f"Failed to update layout data: {str(e)}")

# Event listeners to automatically update timestamps when layout data changes
@event.listens_for(CafeLayoutDbModel.model_layout_data, 'set')
def update_model_layout_timestamp(target, value, oldvalue, initiator):
    """Update model_layout_updated_at when model_layout_data changes"""
    if oldvalue != value:
        target.model_layout_updated_at = datetime.utcnow()
        print(f"--------------------Updated model_layout_updated_at for CafeLayout {target.id} to {target.model_layout_updated_at}")

# Define Cafe model (required for the foreign key relationship)
class Cafe(Base):
    __tablename__ = 'cafes'
    id = Column(Integer, primary_key=True)