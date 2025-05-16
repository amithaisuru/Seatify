import tkinter as tk
import json
from table import Table
from chair import Chair
from cafeLayout import CafeLayout

class DummyCafePopulator:
    def __init__(self):
        self.cafe_layout = CafeLayout()

    def populate_dummy_data(self):
        """
        Populates the cafe layout with dummy tables and chairs.
        """
        # Add tables
        tables = [
            Table("Table1", (50, 50), (150, 150)),
            Table("Table2", (200, 200), (300, 300)),
            Table("Table3", (350, 50), (450, 150))
        ]
        for table in tables:
            self.cafe_layout.add_table(table)

        # Add chairs
        chairs = [
            Chair("Chair1", (40, 40), (60, 60), occupied=True),  # Near Table1, occupied
            Chair("Chair2", (160, 160), (180, 180), occupied=False),  # Near Table1, empty
            Chair("Chair3", (190, 190), (210, 210), occupied=True),  # Near Table2, occupied
            Chair("Chair4", (310, 310), (330, 330), occupied=False),  # Near Table2, empty
            Chair("Chair5", (340, 40), (360, 60), occupied=False),  # Near Table3, empty
            Chair("Chair6", (460, 160), (480, 180), occupied=True)   # Near Table3, occupied
        ]
        for chair in chairs:
            self.cafe_layout.add_chair(chair)

    def display_layout(self):
        """
        Prints the layout as JSON and displays it graphically using tkinter.
        """
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

        # Start the tkinter event loop
        root.mainloop()

if __name__ == "__main__":
    populator = DummyCafePopulator()
    populator.populate_dummy_data()
    populator.display_layout()