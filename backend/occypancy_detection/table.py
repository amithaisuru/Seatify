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
    
    def get_chair_id_list(self):
        chair_id_list =[]
        for chair in self.chairs:
            chair_id_list.append(chair.id)
        print(f"Chair ID list for table {self.id}: {chair_id_list}")
        return chair_id_list
    
    def get_person_id_list(self):
        person_id_list = []
        for person in self.persons:
            person_id_list.append(person.id)
        print(f"Person ID list for table {self.id}: {person_id_list}")
        return person_id_list
