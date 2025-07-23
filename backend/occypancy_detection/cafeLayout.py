import json
import math
from datetime import datetime

import numpy as np
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
      
    def update_databse(self):
        self.sclae_coordinates(400, 400)  # Scale coordinates to fit in a 800x800 canvas
        layout_data = {
            "tables": [],
            "timestamp": datetime.now().isoformat()
        }        
        for table in self.tables:
            center_x = float(table.center[0]) if isinstance(table.center[0], (np.integer, np.floating)) else table.center[0]
            center_y = float(table.center[1]) if isinstance(table.center[1], (np.integer, np.floating)) else table.center[1]
            layout_data["tables"].append({
                "x": center_x,
                "y": center_y,
                "tabel_id": f"T{table.id}",
                "status": "available",
                "chair_count": len(table.chairs),
                "assigned_chairs_IDs": table.get_chair_id_list(),
                "seated_persons_count": len(table.persons),
                "assigned_people_IDs": table.get_person_id_list(),
            })
            layout_data["timestamp"] = datetime.now().isoformat()  # Update timestamp for each table
        print("layout data inside update database---------------------------------------------")
        print(layout_data)
        print("---------------------------------------------------------------------------------")
        cafe_layout_db_handler = CafeLayoutDbModel()
        cafe_layout_db_handler.update_layout_data(layout_data,11)

    def sclae_coordinates(self, width = 400, height = 400):        
        #find max x cordinate in chair or table center
        if not self.tables and not self.chairs:
            print("No tables or chairs to scale.")
            return
        max_x = max(table.center[0] for table in self.tables + self.chairs)
        max_y = max(table.center[1] for table in self.tables + self.chairs)

        # calculate scale factor
        scale_x = width / max_x if max_x > 0 else 1
        scale_y = height / max_y if max_y > 0 else 1

        # adjust center corrdinates of chairs and table
        for table in self.tables:
            table.center = (table.center[0] * scale_x, table.center[1] * scale_y)
        
        for chair in self.chairs:
            chair.center = (chair.center[0] * scale_x, chair.center[1] * scale_y)

    def map_chairs_to_tables_by_distance(self):
        print("map chair to tables by distance called")
        
        for chair in self.chairs:
            min_distance = float('inf')
            closest_table = None

            for table in self.tables:
                #calculate euclidean distance between chair and table center
                distance = math.sqrt((chair.center[0] - table.center[0])**2 + (chair.center[1] - table.center[1])**2)
                if distance < min_distance:
                    min_distance = distance
                    closest_table = table
            
            if closest_table:
                closest_table.add_chair(chair)

    def map_people_to_tables_by_distance(self):
        print("map people to tables by distance called")
        
        for person in self.people:
            if not person.is_sitting:
                continue
            min_distance = float('inf')
            closest_table = None

            for table in self.tables:
                #calculate euclidean distance between person and table center
                distance = math.sqrt((person.center[0] - table.center[0])**2 + (person.center[1] - table.center[1])**2)
                if distance < min_distance:
                    min_distance = distance
                    closest_table = table
            
            if closest_table:
                closest_table.add_person(person)

    def analyze_occupancy(self):
        '''
        detects occupied seats using chair to table mapping and person to table mapping.
        '''
        for table in self.tables:
            num_of_chairs_to_be_occupied = min(len(table.chairs), len(table.persons))
            for i in range(num_of_chairs_to_be_occupied): 
                table.chairs[i].assign_occupant(table.persons[i])
    
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