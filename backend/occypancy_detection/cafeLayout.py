from table import Table
from chair import Chair
from person import Person

class CafeLayout:
    def __init__(self):
        self.tables = []
        self.chairs = []

    def add_table(self, table):
        self.tables.append(table)

    def add_chair(self, chair):
        self.chairs.append(chair)

    def get_layout(self):
        layout = {
            "tables": [],
            "chairs": [],
        }

        #populate tables
        for table in self.tables:
            layout["tables"].append({
                "id": table.id,
                "topLeft": table.topLeft,
                "bottomRight": table.bottomRight,
                "center": table.center
            })
        
        #populate chairs
        for chair in self.chairs:
            layout["chairs"].append({
                "id": chair.id,
                "topLeft": chair.topLeft,
                "bottomRight": chair.bottomRight,
                "center": chair.center,
                "occupied": chair.occupied
            })
        
        return layout