from cafeObjects import CafeObjects


class Chair(CafeObjects):
    def __init__(self, id, topLeft, bottomRight, occupied=False):
        super().__init__(topLeft, bottomRight)
        self.id = id
        self.occupied = occupied
        self.occupant = None
        self.assigned_table = None  # Reference to the table this chair is assigned to
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
    
    def add_to_table(self, table):
        self.assigned_table = table
        table.add_chair(self)

    def __str__(self):
        status = f"occupied by {self.occupant.id}" if self.occupied else "empty"
        return f"Chair {self.id}: {status} at position {self.center}"