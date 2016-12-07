var inquirer = require("inquirer");
var mysql = require('mysql');
var Table = require('cli-table');

var dbPassword = "";
if (typeof process.argv[2] !== undefined) {
    dbPassword = process.argv[2];
}

var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: dbPassword,
    database: 'bamazon'
});
connection.connect();

var defId = null;
var defQty = 1;

doAdmin();

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

function dispSales() {

    var table = new Table({
        head: ["ID", "Department", "Overhead Costs", "Product Sales", "Total Profit"],
        colWidths: [8, 40, 22, 12, 12]
    });

    connection.query("select department_id, department_name, over_head_costs, total_sales, (total_sales - over_head_costs) AS total_profit from departments;", function (err, rows, fields) {
        if (err) throw err;

        console.log("\n--- View Sales by Department ---");

        for (var i = 0; i < rows.length; i++) {
            table.push([rows[i].department_id, rows[i].department_name, rows[i].over_head_costs, rows[i].total_sales, rows[i].total_profit]);
        }

        console.log(table.toString());

        doAnother();

    });

}

function addDept() {

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

        connection.query("INSERT INTO departments (department_name, over_head_costs, total_sales) VALUES (?, ?, ?);",
            [admin.name, admin.overhead, 0], function (err, rows, fields) {

                if (err) throw err;

                doAnother();

            });

    });

}

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
