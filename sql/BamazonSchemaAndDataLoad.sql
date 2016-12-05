CREATE DATABASE Bamazon;
USE Bamazon;
CREATE TABLE products (
	item_id  INT NOT NULL AUTO_INCREMENT,
    product_name  VARCHAR(255),
	department_name VARCHAR(255),
    price  DECIMAL(10,2),
    stock_quantity INT NOT NULL DEFAULT 0,
    PRIMARY KEY (item_id)
);
INSERT INTO products (product_name, department_name, price, stock_quantity)
	VALUES ("Pencil", "Office Products", .89, 5000);
INSERT INTO products (product_name, department_name, price, stock_quantity)
	VALUES ("Writing Tablet", "Office Products", 2.97, 2500);
INSERT INTO products (product_name, department_name, price, stock_quantity)
	VALUES ("File Cabinet", "Office Products", 129.98, 500);
INSERT INTO products (product_name, department_name, price, stock_quantity)
	VALUES ("26-inch Television", "Home Entertainment", 214.47, 300);
INSERT INTO products (product_name, department_name, price, stock_quantity)
	VALUES ("500 watt Stereo Receiver", "Home Entertainment", 199.99, 250);
INSERT INTO products (product_name, department_name, price, stock_quantity)
	VALUES ("47.5 cu.ft. Refrigerator/Freezer", "Appliances", 379.48, 100);
INSERT INTO products (product_name, department_name, price, stock_quantity)
	VALUES ("1200 watt Microwave Oven", "Appliances", 127.99, 250);
INSERT INTO products (product_name, department_name, price, stock_quantity)
	VALUES ("Heavy Duty Kitchen Mixer", "Appliances", 234.99, 60);
INSERT INTO products (product_name, department_name, price, stock_quantity)
	VALUES ("42 pc. Stainless Flatware", "Home", 34.99, 750);
INSERT INTO products (product_name, department_name, price, stock_quantity)
	VALUES ("11x17 Brass Picture Frame", "Home", 17.98, 100);
INSERT INTO products (product_name, department_name, price, stock_quantity)
	VALUES ("Men's Large Raincoat", "Clothing", 49.99, 200);
INSERT INTO products (product_name, department_name, price, stock_quantity)
	VALUES ("Women's Large Raincoat", "Clothing", 49.99, 300);
INSERT INTO products (product_name, department_name, price, stock_quantity)
	VALUES ("Child's Raincoat", "Clothing", 19.99, 500);