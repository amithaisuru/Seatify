from chair import Chair
from person import Person
from table import Table

#test classes
if __name__ == "__main__":
    # Create a person
    person1 = Person("Person1", (10, 20), (30, 40))
    print(f"Person ID: {person1.id}, Center: {person1.center}")

    # Create a chair
    chair1 = Chair("Chair1", (5, 15), (25, 35))
    print(chair1)

    # Assign the person to the chair
    if chair1.assign_occupant(person1):
        print(chair1)
    
    # Remove the person from the chair
    removed_person = chair1.remove_occupant()
    if removed_person:
        print(f"Removed {removed_person.id} from the chair.")
        print(chair1)
    # Create a table
    table1 = Table("Table1", (50, 60), (70, 80))
    print(f"Table ID: {table1.id}, Center: {table1.center}")
    # Create another person
    person2 = Person("Person2", (15, 25), (35, 45))
    print(f"Person ID: {person2.id}, Center: {person2.center}")
    # Create another chair
    chair2 = Chair("Chair2", (20, 30), (40, 50))
    print(chair2)
    # Assign the second person to the second chair
    if chair2.assign_occupant(person2):
        print(chair2)
    # Remove the second person from the second chair
    removed_person2 = chair2.remove_occupant()
    if removed_person2:
        print(f"Removed {removed_person2.id} from the chair.")
        print(chair2)
    # Create another table
    table2 = Table("Table2", (80, 90), (100, 110))
    print(f"Table ID: {table2.id}, Center: {table2.center}")
