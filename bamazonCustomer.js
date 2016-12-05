var inquirer = require("inquirer");
var mysql = require('mysql');
var Table = require('cli-table');

var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Mdd1&Pyd2',
    database: 'bamazon'
});
connection.connect();

var defId = null;
var defQty = 1;

dispAll();

function dispAll() {

    var table = new Table({
        head: ["ID", "Name", "Department", "Price", "Qty Available"],
        colWidths: [8, 40, 22, 12, 12]
    });

    connection.query("SELECT * FROM products;", function (err, rows, fields) {
        if (err) throw err;

        console.log("\n--- Bamazon Product Catalog ---");

        for (var i = 0; i < rows.length; i++) {
            table.push([rows[i].item_id, rows[i].product_name, rows[i].department_name, rows[i].price, rows[i].stock_quantity]);
        }

        console.log(table.toString());

        buyProduct();

    });

}

function buyProduct() {

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

        connection.query("SELECT product_name, price, stock_quantity FROM products WHERE item_id = ?;", [id], function (err, rows, fields) {

            if (err) throw err;

            switch (rows.length) {
                case 1:
                    //console.log(rows[0].stock_quantity);
                    var namProduct = rows[0].product_name;
                    var prcProduct = rows[0].price;
                    var qtyStock = rows[0].stock_quantity;
                    if (qtyStock >= qty) {
                        connection.query("UPDATE products SET stock_quantity = ? WHERE item_id = ?;", [(qtyStock - qty), id], function (err, rows, fields) {
                            if (err) throw err;
                            console.log("\n\nYour total price for: " + namProduct + ", Quantity: " + qty + " is $" + (qty * prcProduct).toFixed(2) + "\n\n");
                            buyMore();
                        });
                    } else {
                        inquirer.prompt([
                            {
                                name: "qty",
                                type: "confirm",
                                message: "There is insufficient quantity for your order. Do you want still want to buy some?"
                            }
                        ]).then(function (answers) {
                            if (answers.qty) {
                                defId = id;
                                defQty = qtyStock;
                                buyProduct();
                            } else {
                                buyMore();
                            }
                        });
                    }
                    break;
                case 0:
                    console.log("Sorry, there is not a product with ID: " + id);
                    buyMore();
                    break;
            }

        });

    });

}

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