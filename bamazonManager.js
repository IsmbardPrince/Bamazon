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

function dispAll() {

    var table = new Table({
        head: ["ID", "Name", "Department", "Price", "Qty Available"],
        colWidths: [8, 40, 22, 12, 12]
    });

    connection.query("SELECT item_id, product_name, department_name, price, stock_quantity FROM products LEFT JOIN departments on products.department_id = departments.department_id ORDER BY department_name, product_name;", function (err, rows, fields) {
        if (err) throw err;

        console.log("\n--- View All Products for Sale ---");

        for (var i = 0; i < rows.length; i++) {
            table.push([rows[i].item_id, rows[i].product_name, rows[i].department_name, rows[i].price, rows[i].stock_quantity]);
        }

        console.log(table.toString());

        doAnother();

    });

}

function dispLowInv() {

    var table = new Table({
        head: ["ID", "Name", "Department", "Price", "Qty Available"],
        colWidths: [8, 40, 22, 12, 12]
    });

    //connection.query("SELECT * FROM products WHERE stock_quantity < ?;", [5], function (err, rows, fields) {
    connection.query("SELECT item_id, product_name, department_name, price, stock_quantity FROM products LEFT JOIN departments on products.department_id = departments.department_id WHERE stock_quantity < ? ORDER BY department_name, product_name;", [5], function (err, rows, fields) {
        if (err) throw err;

        if (rows.length > 0) {

            console.log("\n--- View All Products Low on Inventory ---");

            for (var i = 0; i < rows.length; i++) {
                table.push([rows[i].item_id, rows[i].product_name, rows[i].department_name, rows[i].price, rows[i].stock_quantity]);
            }

            console.log(table.toString());

        } else {

            console.log("\n--- No Products Are Currently Low on Inventory ---");

        }

        doAnother();

    });

}

function addInv() {

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

        connection.query("UPDATE products SET stock_quantity = stock_quantity + ? WHERE item_id = ?;", [admin.qty, admin.id], function (err, rows, fields) {
            if (err) throw err;

            doAnother();

        });

    });

}

function addProd() {

    var departments = [];
    connection.query("SELECT department_name FROM departments ORDER BY department_name;", function (err, rows, fields) {

        if (err) throw err;

        for (var i = 0; i < rows.length; i++) {
            departments.push(rows[i].department_name);
        }

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

            connection.query("SELECT department_id FROM departments WHERE department_name = ?;", [admin.dept], function (err, rows, fields) {

                var dept_id = rows[0].department_id;

                connection.query("INSERT INTO products (product_name, department_id, price, stock_quantity) VALUES (?, ?, ?, ?);",
                    [admin.name, dept_id, admin.price, admin.qty], function (err, rows, fields) {

                        if (err) throw err;

                        doAnother();

                    });

            });

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
