class CafeObjects:
    def __init__(self, top_left, bottom_right):
        self.top_left = top_left  # Top-left corner of the bounding box
        self.bottom_right = bottom_right  # Bottom-right corner of the bounding box
        self.center = (0, 0)  # Center of the object
    
    #calculate the center of the object
    def calculate_center(self):
        x_center = (self.top_left[0] + self.bottom_right[0]) / 2
        y_center = (self.top_left[1] + self.bottom_right[1]) / 2
        self.center = (x_center, y_center)
        return (x_center, y_center)