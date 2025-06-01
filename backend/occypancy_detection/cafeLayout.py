from table import Table
from chair import Chair
from person import Person

class CafeLayout:
    def __init__(self):
        self.tables = []
        self.chairs = []
        self.people = []

    def add_table(self, table):
        self.tables.append(table)

    def add_chair(self, chair):
        self.chairs.append(chair)
    
    def add_person(self, person):
        self.people.append(person)

    def calculateIoU(self, boxA, boxB):
        x1_1, y1_1 = boxA.topLeft
        x2_1, y2_1 = boxA.bottomRight
        x1_2, y1_2 = boxB.topLeft
        x2_2, y2_2 = boxB.bottomRight

        #intersect coordinates
        x_left = max(x1_1, x1_2)
        y_top = max(y1_1, y1_2)
        x_right = min(x2_1, x2_2)
        y_bottom = min(y2_1, y2_2)

        #calculate area of intersection rectangle
        if x_right < x_left or y_bottom < y_top:
            return 0.0
        intersection_area = (x_right - x_left) * (y_bottom - y_top)

        #union area
        boxA_area = (x2_1 - x1_1) * (y2_1 - y1_1)
        boxB_area = (x2_2 - x1_2) * (y2_2 - y1_2)
        union_area = boxA_area + boxB_area - intersection_area

        #calculate IoU
        iou = intersection_area / union_area if union_area > 0 else 0.0
        return iou
    
    def detect_occupancy(self, IOU_THRESHOLD=0.5):
        """
        Detects occupancy of chairs based on their IoU with tables.
        """
        for chair in self.chairs:
            if chair.occupied:
                continue
            for person in self.people:
                iou = self.calculateIoU(chair, person)
                if iou > IOU_THRESHOLD:
                    chair.occupied = True
                    person.sit_down()
                    break

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