from extensions import db

class Location(db.Model):
    __tablename__ = 'locations'

    id = db.Column(db.Integer, primary_key=True)
    location = db.Column(db.String(15), nullable=False)


    def __repr__(self):
        return f"<Location {self.name}>"
