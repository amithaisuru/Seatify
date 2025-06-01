import json
import tkinter as tk

from cafeLayout import CafeLayout
from chair import Chair
from person import Person
from table import Table


class CafeLayoutTester:
    def __init__(self, tables, chairs, people):
        self.cafe_layout = CafeLayout()
        self.populate_layout(tables, chairs, people)

    def populate_layout(self, tables, chairs, people):
        """
        Populates the cafe layout with provided lists of tables, chairs, and people.
        """
        # Add tables
        for table in tables:
            if isinstance(table, Table):
                self.cafe_layout.add_table(table)

        # Add chairs
        for chair in chairs:
            if isinstance(chair, Chair):
                self.cafe_layout.add_chair(chair)

        # Add people
        for person in people:
            if isinstance(person, Person):
                self.cafe_layout.add_person(person)

    def display_layout(self):
        """
        Runs occupancy detection, prints the layout as JSON, and displays it graphically using tkinter.
        """
        # Run occupancy detection
        self.cafe_layout.detect_occupancy(IOU_THRESHOLD=0.2)

        # Get and print the layout as JSON
        layout = self.cafe_layout.get_layout()
        print("Cafe Layout:")
        print(json.dumps(layout, indent=2))

        # Create tkinter window
        root = tk.Tk()
        root.title("Cafe Layout Visualization")
        canvas = tk.Canvas(root, width=500, height=500, bg="white")
        canvas.pack(pady=20)

        # Draw tables
        for table in layout["tables"]:
            x1, y1 = table["topLeft"]
            x2, y2 = table["bottomRight"]
            canvas.create_rectangle(x1, y1, x2, y2, fill="blue", outline="black")
            canvas.create_text((x1 + x2) / 2, (y1 + y2) / 2, text=table["id"], fill="white")

        # Draw chairs
        for chair in layout["chairs"]:
            x1, y1 = chair["topLeft"]
            x2, y2 = chair["bottomRight"]
            fill_color = "green" if chair["occupied"] else "red"
            canvas.create_rectangle(x1, y1, x2, y2, fill=fill_color, outline="black")
            canvas.create_text((x1 + x2) / 2, (y1 + y2) / 2, text=chair["id"], fill="black")

        # Draw people
        for person in self.cafe_layout.people:
            x1, y1 = person.topLeft
            x2, y2 = person.bottomRight
            canvas.create_rectangle(x1, y1, x2, y2, fill="yellow", outline="black")
            canvas.create_text((x1 + x2) / 2, (y1 + y2) / 2, text=person.id, fill="black")

        # Start the tkinter event loop
        root.mainloop()

if __name__ == "__main__":
    # Example usage with dummy data
    tables = [
        # Table("Table1", (50, 50), (150, 150)),
        # Table("Table2", (200, 200), (300, 300)),
        # Table("Table3", (350, 50), (450, 150))
    ]
    chairs = [
        Chair("Chair1", (40, 40), (60, 60)),  # Near Table1
        Chair("Chair2", (160, 160), (180, 180)),  # Near Table1
        Chair("Chair3", (190, 190), (210, 210)),  # Near Table2
        Chair("Chair4", (310, 310), (330, 330)),  # Near Table2
        Chair("Chair5", (340, 40), (360, 60)),  # Near Table3
        Chair("Chair6", (460, 160), (480, 180))   # Near Table3
    ]
    people = [
        Person("Person1", (45, 45), (55, 55)),  # Overlaps with Chair1
        Person("Person2", (195, 195), (205, 205)),  # Overlaps with Chair3
        Person("Person3", (100, 100), (120, 120)),  # No overlap with any chair
        Person("Person4", (465, 165), (475, 175))   # Overlaps with Chair6
    ]

    # Create and display the layout
    tester = CafeLayoutTester(tables, chairs, people)
    tester.display_layout()