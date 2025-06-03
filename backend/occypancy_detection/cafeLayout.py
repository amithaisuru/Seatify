import json

from chair import Chair
from init_db import CafeLayoutDbModel
from person import Person
from table import Table


class CafeLayout:
    def __init__(self):
        self.tables = []
        self.chairs = []
        self.people = []
        self.cafe_id = None

    def read_chair_list(self, chair_list):
        for chair in chair_list:
            chair_id = chair[0]
            top_left = (chair[1], chair[2])
            bottom_right = (chair[3], chair[4])
            chair_obj = Chair(chair_id, top_left, bottom_right)
            self.add_chair(chair_obj)
            print(f"Chair {chair_id} added at {top_left} to {bottom_right}")
    
    def read_table_list(self, table_list):
        for table in table_list:
            table_id = table[0]
            top_left = (table[1], table[2])
            bottom_right = (table[3], table[4])
            table_obj = Table(table_id, top_left, bottom_right)
            self.add_table(table_obj)
            print(f"Table {table_id} added at {top_left} to {bottom_right}")

    def add_table(self, table):
        self.tables.append(table)

    def add_chair(self, chair):
        self.chairs.append(chair)
    
    def add_person(self, id, top_left, bottom_right, posture='unknown'):
        person = Person(id, top_left, bottom_right, posture)
        self.people.append(person)
        print(f"Person {id} added at {top_left} to {bottom_right}")
        print(len(self.people), "is the count of people")

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
        canvas = tk.Canvas(root, width=1024, height=720, bg="white")
        canvas.pack(pady=20)

        # Draw tables
        for table in self.tables:
            x1, y1 = table.topLeft
            x2, y2 = table.bottomRight
            canvas.create_rectangle(x1, y1, x2, y2, fill="blue", outline="black")
            canvas.create_text((x1 + x2) / 2, (y1 + y2) / 2, text=table.id, fill="white")

        # Draw chairs
        for chair in self.chairs:
            print(f"Drawing chair {chair.id} at {chair.topLeft} to {chair.bottomRight}, occupied: {chair.occupied}")
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
        
        #make dummy details for testing
        layout_test_data = {
            "chairs": [
                {"x": 100, "y": 100, "label": "C1", "status": "available"},
                {"x": 200, "y": 100, "label": "C2", "status": "occupied"}
            ],
            "tables": [
                {"x": 150, "y": 150, "label": "T1"}
            ]
        }
        cafe_layut_db_handler = CafeLayoutDbModel()
        cafe_layut_db_handler.update_layout_data(layout_data,3)