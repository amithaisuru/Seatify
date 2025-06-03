from cafeObjects import CafeObjects


class Person(CafeObjects):
    def __init__(self, id, topLeft, bottomRight, posture = 'unknown'):
        super().__init__(topLeft, bottomRight)
        self.calculate_center()
        self.id = id
        if posture == 'sitting':
            self.is_sitting = True
        else:
            self.is_sitting = False
    
    def sit_down(self):
        self.is_sitting = True
        print(f"{self.id} is now seated.")
    
    def stand_up(self):
        self.is_sitting = False
        print(f"{self.id} has stood up.")