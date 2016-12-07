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
            message: "Which product function do you want to perform?",
            choices: ["View Products for Sale", "View Low Inventory", "Add to Inventory", "Add New Product"]
        }
    ]).then(function (admin) {

        switch (admin.operation) {

            case "View Products for Sale":
                dispAll();
                break;

            case "View Low Inventory":
                dispLowInv();
                break;

            case "Add to Inventory":
                addInv();
                break;

            case "Add New Product":
                addProd()
                break;

        }
    });
}

// This function will display a table of all products in the catalog/database
function dispAll() {

    // create a new formatted cli-table
    var table = new Table({
        head: ["ID", "Name", "Department", "Price", "Qty Available"],
        colWidths: [8, 40, 22, 12, 12]
    });

    // get the data to load the product table, load it and show it; note that since the database is normalized, we JOIN with the departments table
    // to get the actual department name
    connection.query("SELECT item_id, product_name, department_name, price, stock_quantity FROM products LEFT JOIN departments on products.department_id = departments.department_id ORDER BY department_name, product_name;", function (err, rows, fields) {

        if (err) throw err;

        console.log("\n--- View All Products for Sale ---");

        for (var i = 0; i < rows.length; i++) {
            table.push([rows[i].item_id, rows[i].product_name, rows[i].department_name, rows[i].price, rows[i].stock_quantity]);
        }

        console.log(table.toString());

        // ask the user if they want to continue
        doAnother();

    });

}

// This function will display a table which contains all products that currently have a low inventory level (i.e. less than 5)
function dispLowInv() {

    // create a new formatted cli-table
    var table = new Table({
        head: ["ID", "Name", "Department", "Price", "Qty Available"],
        colWidths: [8, 40, 22, 12, 12]
    });

    // get the data to load the table, load it and show it; note that since the database is normalized, we JOIN with the departments table
    // to get the actual department name
    connection.query("SELECT item_id, product_name, department_name, price, stock_quantity FROM products LEFT JOIN departments on products.department_id = departments.department_id WHERE stock_quantity < ? ORDER BY department_name, product_name;", [5], function (err, rows, fields) {

        if (err) throw err;

        // if rows were returned for the query, load the table with them
        if (rows.length > 0) {

            console.log("\n--- View All Products Low on Inventory ---");

            for (var i = 0; i < rows.length; i++) {
                table.push([rows[i].item_id, rows[i].product_name, rows[i].department_name, rows[i].price, rows[i].stock_quantity]);
            }

            console.log(table.toString());

        // otherwise log a message that no products currently meet the low inventory definition
        } else {

            console.log("\n--- No Products Are Currently Low on Inventory ---");

        }

        // ask the user if they want to continue
        doAnother();

    });

}

// This function allows a manager to add inventory to a specific product in the database
function addInv() {

    // get the product and amount to increase inventory by
    inquirer.prompt([
        {
            name: "id",
            type: "input",
            message: "Add inventory to which product ID?"
        },
        {
            name: "qty",
            type: "input",
            message: "Add how much to inventory?"
        }
    ]).then(function (admin) {

        // update the inventory as specified
        connection.query("UPDATE products SET stock_quantity = stock_quantity + ? WHERE item_id = ?;", [admin.qty, admin.id], function (err, rows, fields) {
            if (err) throw err;

            // ask the user if they want to continue
            doAnother();

        });

    });

}

// This function allows a manager to add a new product to the catalog/database
function addProd() {

    // get a list of department names for the which department to add the product to prompt
    var departments = [];
    connection.query("SELECT department_name FROM departments ORDER BY department_name;", function (err, rows, fields) {

        if (err) throw err;

        // put the names in an array which can be used by an inquirer list type prompt
        for (var i = 0; i < rows.length; i++) {
            departments.push(rows[i].department_name);
        }

        // get the information from the manager necessary to add the new product to the catalog/database
        inquirer.prompt([
            {
                name: "name",
                type: "input",
                message: "What is the name of the product to add?"
            },
            {
                name: "dept",
                type: "list",
                message: "Add to which department?",
                choices: departments
            },
            {
                name: "price",
                type: "input",
                message: "What is the price?"
            },
            {
                name: "qty",
                type: "input",
                message: "Add how much initial inventory?"
            }
        ]).then(function (admin) {

            // get the department id for the new product's department as it will be needed when the product is added to the database
            connection.query("SELECT department_id FROM departments WHERE department_name = ?;", [admin.dept], function (err, rows, fields) {

                var dept_id = rows[0].department_id;

                // add the new product information to the catalog/database
                connection.query("INSERT INTO products (product_name, department_id, price, stock_quantity) VALUES (?, ?, ?, ?);",
                    [admin.name, dept_id, admin.price, admin.qty], function (err, rows, fields) {

                        if (err) throw err;

                        // ask the user if they want to continue
                        doAnother();

                    });

            });

        });

    });

}

// This function just asks the manager if they would like to perform another admin function and if so, calls the main function recursively
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
