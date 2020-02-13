INSERT INTO department (department)
VALUES ("Management"), ("Engineering");

INSERT INTO role (title, salary, department_id)
VALUES ("Manager", 100000, "1"), ("Engineer", 80000, "2"), ("Engineer", 70000, "2");

INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES ("Harry", "Potter", "1", "1"), ("Hermoine", "Grainger", "2", null), ("Ron", "Weasley", "3", null)