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

    def map_people_to_chairs(self):
        print("map people to chairs called")
        for table in self.tables:
            number_of_chairs = len(table.chairs)
            iou_value = []
            #calculate iou of each person with the table using calculate_iou method.
            for person in self.people:
                if not person.is_sitting:
                    continue
                person_box = (person.top_left[0], person.top_left[1], person.bottom_right[0], person.bottom_right[1])
                table_box = (table.top_left[0], table.top_left[1], table.bottom_right[0], table.bottom_right[1])
                iou = self.calculate_iou(person_box, table_box)
                if iou > 0.1:
                    iou_value.append((iou, person))
                # Sort the iou_value list in descending order based on the iou value
            iou_value.sort(reverse=True, key=lambda x: x[0])
            # Map the top N people to the chairs, where N is the number of chairs
            for i in range(min(number_of_chairs, len(iou_value))):
                person = iou_value[i][1]
                chair = table.chairs[i]
                if chair.assign_occupant(person):
                    print(f"Person {person.id} is assigned to Chair {chair.id} at Table {table.id}")
                else:
                    print(f"Person {person.id} could not be assigned to Chair {chair.id} at Table {table.id}")
                        
    
    def map_chairs_to_tables(self):
        print("map chair to tables called")
        iou_threshold = 0.25
        for chair in self.chairs:
            #pass if chair already occupied
            if chair.occupied:
                continue
            best_table = None
            best_iou = 0
            chair_box = (chair.top_left[0], chair.top_left[1], chair.bottom_right[0], chair.bottom_right[1])
            for table in self.tables:
                table_box = (table.top_left[0], table.top_left[1], table.bottom_right[0], table.bottom_right[1])
                iou = self.calculate_iou(chair_box, table_box)
                if iou > best_iou and iou > iou_threshold:
                    best_iou = iou
                    best_table = table
            if best_table:
                best_table.add_chair(chair)
                print(f"Chair {chair.id} assigned to Table {best_table.id} with IoU {best_iou:.2f}")
            else:
                print(f"Chair {chair.id} could not be assigned to any table")
    
    def calculate_iou(self, box1, box2):
        x1, y1, x2, y2 = box1
        x1b, y1b, x2b, y2b = box2
        xi1, yi1 = max(x1, x1b), max(y1, y1b)
        xi2, yi2 = min(x2, x2b), min(y2, y2b)
        inter_w = max(0, xi2 - xi1)
        inter_h = max(0, yi2 - yi1)
        inter = inter_w * inter_h
        area1 = (x2 - x1) * (y2 - y1)
        area2 = (x2b - x1b) * (y2b - y1b)
        union = area1 + area2 - inter
        return inter / union if union > 0 else 0