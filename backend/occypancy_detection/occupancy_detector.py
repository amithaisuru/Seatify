from cafeLayout import CafeLayout
from chair import Chair
from person import Person
from table import Table

seat_list = [[2, 147, 146, 255, 299], [4, 425, 211, 516, 361], [5, 412, 55, 503, 192], [6, 518, 357, 670, 430], [8, 320, 27, 388, 87], [9, 4, 105, 103, 239]]
cafe_layout = CafeLayout()
cafe_layout.read_chair_list(seat_list)
cafe_layout.show_graphical_layout()