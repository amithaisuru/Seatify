from cafeObjects import CafeObjects

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