from cafeObjects import CafeObjects


class Table(CafeObjects):
    def __init__(self, id, topLeft, bottomRight):
        super().__init__(topLeft, bottomRight)
        self.id = id
        self.calculate_center()
        self.chairs = []
        self.persons = []
    
    def add_chair(self, chair):
        if chair not in self.chairs:
            self.chairs.append(chair)
            chair.assigned_table = self
    
    def add_person(self, person):
        if person not in self.persons:
            self.persons.append(person)
            person.assigned_table = self
