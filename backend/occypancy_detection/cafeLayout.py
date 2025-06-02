import json

from chair import Chair
from person import Person
from table import Table


class CafeLayout:
    def __init__(self):
        self.tables = []
        self.chairs = []
        self.people = []

    def read_chair_list(self, chair_list):
        for chair in chair_list:
            chair_id = chair[0]
            top_left = (chair[1], chair[2])
            bottom_right = (chair[3], chair[4])
            chair_obj = Chair(chair_id, top_left, bottom_right)
            self.add_chair(chair_obj)

    def add_table(self, table):
        self.tables.append(table)

    def add_chair(self, chair):
        self.chairs.append(chair)
    
    def add_person(self, person):
        self.people.append(person)

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
    
    def show_graphical_layout(self):
        import json
        import tkinter as tk

        root = tk.Tk()
        root.title("Cafe Layout Visualization")
        canvas = tk.Canvas(root, width=500, height=500, bg="white")
        canvas.pack(pady=20)

        # Draw tables
        for table in self.tables:
            x1, y1 = table.topLeft
            x2, y2 = table.bottomRight
            canvas.create_rectangle(x1, y1, x2, y2, fill="blue", outline="black")
            canvas.create_text((x1 + x2) / 2, (y1 + y2) / 2, text=table.id, fill="white")

        # Draw chairs
        for chair in self.chairs:
            x1, y1 = chair.topLeft
            x2, y2 = chair.bottomRight
            fill_color = "green" if chair.occupied else "red"
            canvas.create_rectangle(x1, y1, x2, y2, fill=fill_color, outline="black")
            canvas.create_text((x1 + x2) / 2, (y1 + y2) / 2, text=chair.id, fill="black")

        root.mainloop()
    
    def update_chair_occupancy(self, chair_id, occupied=False, person_id=None):
        for chair in self.chairs:
            if chair.id == chair_id:
                chair.occupied = occupied
                if occupied and person_id is not None:
                    chair.occupant = person_id
                else:
                    chair.occupant = None
                break
    
    def update_databse(self):
        '''
        meke below format and update it in to databse
        {"chairs": [{"x": 80, "y": 60, "label": "C1", "status": "available"}, {"x": 150, "y": 60, "label": "C2", "status": "occupied"}, {"x": 80, "y": 120, "label": "C3", "status": "occupied"}, {"x": 170, "y": 90, "label": "C13", "status": "occupied"}, {"x": 160, "y": 130, "label": "C4", "status": "occupied"}, {"x": 130, "y": 150, "label": "C5", "status": "occupied"}, {"x": 280, "y": 60, "label": "C10", "status": "available"}, {"x": 320, "y": 60, "label": "C6", "status": "occupied"}, {"x": 360, "y": 80, "label": "C11", "status": "occupied"}, {"x": 370, "y": 110, "label": "C9", "status": "occupied"}, {"x": 280, "y": 120, "label": "C7", "status": "available"}, {"x": 350, "y": 140, "label": "C8", "status": "occupied"}, {"x": 310, "y": 140, "label": "C12", "status": "occupied"}], "tables": [{"x": 100, "y": 80, "label": "T1"}, {"x": 300, "y": 80, "label": "T2"}]}
        the column in : model_layout_data = db.Column(db.JSON, nullable=True)
        '''
        layout_data = {
            "chairs": [],
            "tables": []
        }
        for chair in self.chairs:
            layout_data["chairs"].append({
                "x": chair.center[0],
                "y": chair.center[1],
                "label": f"C{chair.id}",
                "status": "occupied" if chair.occupied else "available"
            })
        
        for table in self.tables:
            layout_data["tables"].append({
                "x": table.center[0],
                "y": table.center[1],
                "label": f"T{table.id}"
            })