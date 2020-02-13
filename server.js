const mysql = require("mysql");
const inquirer = require("inquirer");
const cTable = require('console.table');

// create the connection
var connection = mysql.createConnection({
    host: "localhost",
    port: process.env.PORT || 3306,
    user: "root",
    password: "password",
    database: "employeetracker_db"
});

// connect to the server and database
connection.connect(function (err) {
    if (err) throw err;
    start();
});

// start function asks the user what they want to do
function start() {
    inquirer
        .prompt({
            name: "action",
            type: "list",
            message: "What would you like to do?",
            choices: ["Add a department", "Add a role", "Add an employee", "Update employee role", "View departments, roles, or employees", "Exit"]
        })
        .then(function (answer) {
            // Switch redirects to helper functions for each case
            switch (answer.action) {
                case "Add a department":
                    addDept();
                    break;
                case "Add a role":
                    addRole();
                    break;
                case "Add an employee":
                    addEmployee();
                    break;
                case "Update employee role":
                    updateRole();
                    break;
                case "View departments, roles, or employees":
                    viewInfo();
                    break;
                case "Exit":
                    connection.end();
                    break;
                default:
                    console.log("\n \n Something went wrong");
                    connection.end();
            }
        });
}

// Helper function to add a new department
function addDept() {
    // show the existing departments 
    connection.query("SELECT * FROM department", function (err, results) {
        if (err) throw err;
        console.log("\n \n These are the current departments: ")
        console.table(results);
        // Ask for a new department name
        inquirer.prompt([
            {
                name: "department",
                type: "input",
                message: "Enter the name of the new department:"
            }
        ])
            .then(function (answer) {
                // Add the new department
                connection.query("INSERT INTO department set ?",
                    { department: answer.department }
                    ,
                    function (err) {
                        if (err) throw err;
                        console.log("\n \n New department added:" + answer.department);
                        // re-start the application
                        start();
                    }
                );
            })
    });
}

// function to add a new role
function addRole() {
    // show the existing departments (so user can see ids)
    connection.query("SELECT * FROM department", function (err, results) {
        if (err) throw err;
        console.log("\n \n These are the current departments:")
        console.table(results)
        // prompt for a new role title, salary, and matching dept id
        inquirer
            .prompt([
                {
                    name: "role",
                    type: "input",
                    message: "Enter the name of the new role:"
                },
                {
                    name: "salary",
                    type: "input",
                    message: "Enter the salary"
                },
                {
                    name: "dept",
                    type: "input",
                    message: "Enter the id of the role's department (use the table above):"
                }
            ])
            .then(function (answer) {
                // Add the new department
                connection.query("INSERT INTO role set ?", {
                    title: answer.role,
                    salary: answer.salary,
                    department_id: answer.dept
                },
                    function (err) {
                        if (err) throw err;
                        console.log("\n \n New role added: " + answer.role);
                        // re-start the application
                        start();
                    }
                );
            })
    });
}

// Helper function to add a new employee
function addEmployee() {
    // show the existing roles and keys
    connection.query("SELECT * FROM role", function (err, results) {
        if (err) throw err;
        console.log("\n \n These are the current roles: ")
        console.table(results)
        // prompt for a new employee name, matching role id, and manager id 
        inquirer
            .prompt([
                {
                    name: "first",
                    type: "input",
                    message: "Enter the employee's first name"
                },
                {
                    name: "last",
                    type: "input",
                    message: "Enter the employee's last name"
                },
                {
                    name: "role",
                    type: "input",
                    message: "Enter the id of the employee's role (use the table above):"
                },
                {
                    name: "manager",
                    type: "input",
                    message: "Enter the employee's manager ID"
                }
            ])
            .then(function (answer) {
                // Set the manager ID to null
                var managerID = null
                // If the manager ID answer is a number, change it to that number
                if (isNaN(answer.manager) === false) {
                    managerID = answer.manager
                }
                // Add the employee
                connection.query("INSERT INTO employee set ?", {
                    first_name: answer.first,
                    last_name: answer.last,
                    role_id: answer.role,
                    manager_id: managerID
                },
                    function (err) {
                        if (err) throw err;
                        console.log("\n \n New employee added:" + answer.first + " " + answer.last);
                        // re-start the application
                        start();
                    }
                );
            })
    });
}

// Helper function to update roles
function updateRole() {
    // query the database for all employees
    connection.query("SELECT * FROM employee", function (err, results) {
        if (err) throw err;
        // loop through the employees and ask the user which they want to update
        inquirer
            .prompt([
                {
                    name: "employee",
                    type: "rawlist",
                    choices: function () {
                        var choiceArray = [];
                        for (var i = 0; i < results.length; i++) {
                            choiceArray.push(results[i].first_name + " " + results[i].last_name);
                        }
                        return choiceArray;
                    },
                    message: "Whose role would you like to update?"
                },
                // Ask for a new title and salary
                {
                    name: "title",
                    type: "input",
                    message: "Enter the employee's new title:"
                },
                {
                    name: "salary",
                    type: "input",
                    message: "Enter the employee's new salary:"
                }])
            .then(function (answer) {
                // get the information of the chosen employee
                var chosenEmployee;
                for (var i = 0; i < results.length; i++) {
                    if (results[i].first_name + " " + results[i].last_name === answer.employee) {
                        chosenEmployee = results[i];
                    }
                };
                // Make the salary into an integer
                var newSalary = parseInt(answer.salary);
                // Update that role with the newly entered information
                connection.query(
                    "UPDATE role INNER JOIN employee on employee.role_id = role.id " +
                    "SET ?, ? where ?",
                    [
                        {
                            salary: newSalary
                        },
                        {
                            title: answer.title
                        },
                        {
                            last_name: chosenEmployee.last_name
                        }
                    ],
                    function (error) {
                        if (error) console.log(error);
                        console.log("\n \n Updated " + chosenEmployee.first_name + " " + chosenEmployee.last_name);
                        // re-start the application
                        start();
                    });
            });
    });
}

// Helper Function to view individual tables
function tableInfo(tableToView) {
    connection.query("SELECT * FROM " + tableToView, function (err, results) {
        if (err) throw err;
        console.log("\n \nThese are the current " + tableToView + "s: ")
        console.table(results);
        start();
    })
}

// Helper Function to view all joined info from 3 tables
function allInfo() {
    // Show all current information joined in 1 table
    connection.query('SELECT employee.id, employee.first_name, employee.last_name, ' +
        'role.title, role.salary, role.id, department.department, department.id ' +
        'from ((employee inner join role on employee.role_id = role.id) ' +
        'inner join department on role.department_id = department.id) order by employee.id asc', function (err, results) {
            if (err) throw err;
            console.log("\n \n This is all the current information: ")
            console.table(results);
            start();
        })
}

// function to view tables
function viewInfo() {
    // Ask which table the user wants to see
    inquirer.prompt({
        name: "table",
        type: "list",
        message: "Which information would you like to view?",
        choices: ["Departments", "Roles", "Employees", "Everything", "Exit"]
    })
        // Switch uses the helper functions and enters in the answer to return the table the user wants
        .then(function (answer) {
            switch (answer.table) {
                case "Departments":
                    tableInfo("department");
                    break;
                case "Roles":
                    tableInfo("role");
                    break;
                case "Employees":
                    tableInfo("employee");
                    break;
                case "Everything":
                    allInfo();
                    break;
                case "Exit":
                    connection.end();
                    break;
                default:
                    console.log("\n \n Something went wrong, try again");
                    connection.end();
            }
        });
}