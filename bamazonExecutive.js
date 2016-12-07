// load required node modules
var inquirer = require("inquirer");
var mysql = require('mysql');
var Table = require('cli-table');

// see if a MySQL database password is provided
var dbPassword = "";
if (typeof process.argv[2] !== undefined) {
    dbPassword = process.argv[2];
}

// open a connection to the Bamazon database
var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: dbPassword,
    database: 'bamazon'
});
connection.connect();

// start the app here
doAdmin();

// This is the main function for the app. It prompts for an admin function to perform and calls the appropriate processing function
// based on user input. After an admin function is completed, the user is given an opportunity to perform another function, which will
// result in a recursive call to this function for selecting and performing another admin function.
function doAdmin() {

    inquirer.prompt([
        {
            name: "operation",
            type: "list",
            message: "Which department function do you want to perform?",
            choices: ["View Product Sales by Department", "Create New Department"]
        }
    ]).then(function (admin) {

        switch (admin.operation) {

            case "View Product Sales by Department":
                dispSales();
                break;

            case "Create New Department":
                addDept();
                break;

        }
    });
}

// This function will display a table of the total sales for all departments
function dispSales() {

    // create a new formatted cli-table
    var table = new Table({
        head: ["ID", "Department", "Overhead Costs", "Product Sales", "Total Profit"],
        colWidths: [8, 40, 22, 12, 12]
    });


    // get the data to load the departments table, load it and show it; note that a computed alias column is used to load each departments total profit
    connection.query("select department_id, department_name, over_head_costs, total_sales, (total_sales - over_head_costs) AS total_profit from departments;", function (err, rows, fields) {
        if (err) throw err;

        console.log("\n--- View Sales by Department ---");

        for (var i = 0; i < rows.length; i++) {
            table.push([rows[i].department_id, rows[i].department_name, rows[i].over_head_costs, rows[i].total_sales, rows[i].total_profit]);
        }

        console.log(table.toString());

        // ask the user if they want to continue
        doAnother();

    });

}

// This function allows an executive to add a new department to the database
function addDept() {

    // get the information necessary to add the new department
    inquirer.prompt([
        {
            name: "name",
            type: "input",
            message: "What is the name of the department you want to add?"
        },
        {
            name: "overhead",
            type: "input",
            message: "What is the overhead per period of the new department?"
        }
    ]).then(function (admin) {

        // add the new department to the database
        connection.query("INSERT INTO departments (department_name, over_head_costs, total_sales) VALUES (?, ?, ?);",
            [admin.name, admin.overhead, 0], function (err, rows, fields) {

                if (err) throw err;

                // ask the user if they want to continue
                doAnother();

            });

    });

}

// This function just asks the executive if they would like to perform another admin function and if so, calls the main function recursively
function doAnother() {

    inquirer.prompt([
        {
            name: "continue",
            type: "confirm",
            message: "Do you want perform another function?"
        }
    ]).then(function (answers) {
        if (answers.continue) {
            doAdmin();
        } else {
            connection.end();
        }
    });

}
