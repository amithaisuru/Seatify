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