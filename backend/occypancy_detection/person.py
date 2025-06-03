from cafeObjects import CafeObjects


class Person(CafeObjects):
    def __init__(self, id, topLeft, bottomRight, posture = 'unknown'):
        super().__init__(topLeft, bottomRight)
        self.calculate_center()
        self.id = id
        if posture == 'sitting':
            self.seated = True
        else:
            self.seated = False
    
    def sit_down(self):
        self.seated = True
        print(f"{self.id} is now seated.")
    
    def stand_up(self):
        self.seated = False
        print(f"{self.id} has stood up.")