from cafeObjects import CafeObjects

class Table(CafeObjects):
    def __init__(self, id, topLeft, bottomRight):
        super().__init__(topLeft, bottomRight)
        self.id = id
        self.calculate_center()