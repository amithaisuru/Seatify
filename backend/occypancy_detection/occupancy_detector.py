class CafeObjects:
    def __init__(self, topLeft, bottomRight):
        self.topLeft = topLeft  # Top-left corner of the bounding box
        self.bottomRight = bottomRight  # Bottom-right corner of the bounding box
        self.center = (0, 0)  # Center of the object
    
    #calculate the center of the object
    def calculate_center(self):
        x_center = (self.topLeft[0] + self.bottomRight[0]) / 2
        y_center = (self.topLeft[1] + self.bottomRight[1]) / 2
        self.center = (x_center, y_center)
        return (x_center, y_center)

class Person(CafeObjects):
    def __init__(self, id, topLeft, bottomRight):
        super().__init__(topLeft, bottomRight)
        self.calculate_center()
        self.id = id
        self.seated = False
    
    def sit_down(self):
        self.seated = True
        print(f"{self.id} is now seated.")
    
    def stand_up(self):
        self.seated = False
        print(f"{self.id} has stood up.")

class Chair(CafeObjects):
    def __init__(self, id, topLeft, bottomRight, occupied=False):
        super().__init__(topLeft, bottomRight)
        self.id = id
        self.occupied = occupied
        self.occupant = None
        self.calculate_center()

    def assign_occupant(self, person):
        if not self.occupied and person:
            self.occupied = True
            self.occupant = person
            person.sit_down()
            return True
        return False

    def remove_occupant(self):
        if self.occupied and self.occupant:
            person = self.occupant
            self.occupied = False
            self.occupant = None
            person.stand_up()
            return person
        return None

    def __str__(self):
        status = f"occupied by {self.occupant.id}" if self.occupied else "empty"
        return f"Chair {self.id}: {status} at position {self.center}"

class Table(CafeObjects):
    def __init__(self, id, topLeft, bottomRight):
        super().__init__(topLeft, bottomRight)
        self.id = id
        self.calculate_center()

#test classes
if __name__ == "__main__":
    # Create a person
    person1 = Person("Person1", (10, 20), (30, 40))
    print(f"Person ID: {person1.id}, Center: {person1.center}")

    # Create a chair
    chair1 = Chair("Chair1", (5, 15), (25, 35))
    print(chair1)

    # Assign the person to the chair
    if chair1.assign_occupant(person1):
        print(chair1)
    
    # Remove the person from the chair
    removed_person = chair1.remove_occupant()
    if removed_person:
        print(f"Removed {removed_person.id} from the chair.")
        print(chair1)
    # Create a table
    table1 = Table("Table1", (50, 60), (70, 80))
    print(f"Table ID: {table1.id}, Center: {table1.center}")
    # Create another person
    person2 = Person("Person2", (15, 25), (35, 45))
    print(f"Person ID: {person2.id}, Center: {person2.center}")
    # Create another chair
    chair2 = Chair("Chair2", (20, 30), (40, 50))
    print(chair2)
    # Assign the second person to the second chair
    if chair2.assign_occupant(person2):
        print(chair2)
    # Remove the second person from the second chair
    removed_person2 = chair2.remove_occupant()
    if removed_person2:
        print(f"Removed {removed_person2.id} from the chair.")
        print(chair2)
    # Create another table
    table2 = Table("Table2", (80, 90), (100, 110))
    print(f"Table ID: {table2.id}, Center: {table2.center}")
