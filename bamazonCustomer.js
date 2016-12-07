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

// Although it doesn't look as good as hoped, these defaults are defined here so that they can be set to previous user entries in the
// case that they want to buy a lesser quantity of a product when there is insufficient inventory for their first request
var defId = null;
var defQty = 1;

// start the app here
dispAll();

// This is the main function of the bamazonCustomer app. It displays the product catalog table and starts the customer buy process.
// When one product buy cycle is complete, the user is asked if they want to buy another product and if the answer is affirmative,
// this function is called recursively for additional purchases.
function dispAll() {

    // create a new formatted cli-table
    var table = new Table({
        head: ["ID", "Name", "Department", "Price", "Qty Available"],
        colWidths: [8, 40, 22, 12, 12]
    });

    // get the data to load the product table, load it and show it
    connection.query("SELECT item_id, product_name, department_name, price, stock_quantity FROM products LEFT JOIN departments on products.department_id = departments.department_id ORDER BY department_name, product_name;", function (err, rows, fields) {

        if (err) throw err;

        console.log("\n--- Bamazon Product Catalog ---");

        for (var i = 0; i < rows.length; i++) {
            table.push([rows[i].item_id, rows[i].product_name, rows[i].department_name, rows[i].price, rows[i].stock_quantity]);
        }

        console.log(table.toString());

        // go to the actual purchasing part of the app
        buyProduct();

    });

}

// This function handles getting the user's purchase request and either fulfilling it or informing them it cannot be fulfilled. If it can't
// be fulfilled because of insufficient inventory, the user can choose to buy a lesser quantity which will cause this function to be called recursively.
function buyProduct() {

    // get the user's purchase request
    inquirer.prompt([
        {
            name: "id",
            type: "input",
            message: "What is the ID of the product you want to buy?",
            default: defId
        },
        {
            name: "qty",
            type: "input",
            message: "How many do you want to buy?",
            default: defQty
        }
    ]).then(function (answers) {

        var id = answers.id;
        var qty = answers.qty;

        // get the necessary information from the database to actually process the order
        connection.query("SELECT product_name, department_id, price, stock_quantity FROM products WHERE item_id = ?;", [id], function (err, rows, fields) {

            if (err) throw err;

            // different cases of database results
            switch (rows.length) {
                // One row returned is the normal case as the requested id should be unique
                case 1:
                    var namProduct = rows[0].product_name;
                    var idDept = rows[0].department_id;
                    var prcProduct = rows[0].price;
                    var qtyStock = rows[0].stock_quantity;
                    // check for sufficient inventory for the order
                    if (qtyStock >= qty) {
                        // if sufficient inventory then execute the order and update the database
                        connection.query("UPDATE products SET stock_quantity = ? WHERE item_id = ?;", [(qtyStock - qty), id], function (err, rows, fields) {
                            if (err) throw err;
                            // compute the total price to the customer for this order and display it for the customer
                            var totSale = qty * prcProduct;
                            console.log("\n\nYour total price for: " + namProduct + ", Quantity: " + qty + " is $" + totSale.toFixed(2) + "\n\n");
                            // add the total price for this order to the department sales total in the database
                            connection.query("UPDATE departments SET total_sales = total_sales + ? WHERE department_id = ?;", [totSale, idDept], function (err, rows, fields) {
                                if (err) throw err;
                                // ask the customer if they want to continue purchasing more products
                                buyMore();
                            });
                        });
                    } else {
                        // if there is insufficient inventory for the initial order, ask the customer if they would still like to purchase a smaller amount
                        inquirer.prompt([
                            {
                                name: "qty",
                                type: "confirm",
                                message: "There is insufficient quantity for your order. Do you want still want to buy some?"
                            }
                        ]).then(function (answers) {
                            // if the user does want to buy a smaller quantity, set the order defaults and go back to the start of the purchase process
                            if (answers.qty) {
                                defId = id;
                                defQty = qtyStock;
                                buyProduct();
                            // otherwise just ask the customer if they would like to buy any other products
                            } else {
                                buyMore();
                            }
                        });
                    }
                    break;
                // if no rows were returned from the original product query, then let the customer know the product id was invalid and ask if they would like to continue
                case 0:
                    console.log("Sorry, there is not a product with ID: " + id);
                    buyMore();
                    break;
            }

        });

    });

}

// This function just asks the customer if they would like to continue buying product and if so, calls the main function recursively
function buyMore() {

    inquirer.prompt([
        {
            name: "continue",
            type: "confirm",
            message: "Do you want to buy another product?"
        }
    ]).then(function (answers) {
        if (answers.continue) {
            defId = null;
            defQty = 1;
            dispAll();
        } else {
            connection.end();
        }
    });

}