drop database if exists employeetracker_db;

create database employeetracker_db;

use employeetracker_db;

create TABLE department (
    id integer(11) auto_increment not null,
    department varchar(30) not null,
    primary key(id)
);

create TABLE role (
    id integer(11) auto_increment not NULL,
    title varchar(30) not NULL,
    salary decimal(10, 2) not NULL,
    department_id INTEGER(11),
    primary key(id),
    foreign key(department_id) REFERENCES department(id)
);

create TABLE employee (
    id integer(11) auto_increment not NULL,
    first_name varchar(30) not NULL,
    last_name varchar(30) not null,
    role_id integer(11) not null,
    manager_id integer(11),
    primary key(id),
    foreign key(role_id) REFERENCES role(id),
    foreign key(manager_id) references employee(id)
)