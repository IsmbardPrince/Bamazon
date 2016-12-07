CREATE DATABASE Bamazon;
USE Bamazon;
CREATE TABLE departments (
	department_id  INT NOT NULL AUTO_INCREMENT,
    department_name  VARCHAR(255),
    over_head_costs  DECIMAL(10,2),
    total_sales  DECIMAL(10,2) DEFAULT 0,
    PRIMARY KEY (department_id)
);
CREATE TABLE products (
	item_id  INT NOT NULL AUTO_INCREMENT,
    product_name  VARCHAR(255),
	department_id INT NOT NULL,
    price  DECIMAL(10,2),
    stock_quantity INT NOT NULL DEFAULT 0,
    PRIMARY KEY (item_id)
);
INSERT INTO departments (department_name, over_head_costs, total_sales)
	VALUES ("Appliances", 30000, 0);
INSERT INTO departments (department_name, over_head_costs, total_sales)
	VALUES ("Clothing", 15000, 0);
INSERT INTO departments (department_name, over_head_costs, total_sales)
	VALUES ("Home", 10000, 0);
INSERT INTO departments (department_name, over_head_costs, total_sales)
	VALUES ("Home Entertainment", 20000, 0);
INSERT INTO departments (department_name, over_head_costs, total_sales)
	VALUES ("Office Products", 5000, 0);
INSERT INTO products (product_name, department_id, price, stock_quantity)
	VALUES ("Pencil", 5, .89, 5000);
INSERT INTO products (product_name, department_id, price, stock_quantity)
	VALUES ("Writing Tablet", 5, 2.97, 2500);
INSERT INTO products (product_name, department_id, price, stock_quantity)
	VALUES ("File Cabinet", 5, 129.98, 500);
INSERT INTO products (product_name, department_id, price, stock_quantity)
	VALUES ("26-inch Television", 4, 214.47, 300);
INSERT INTO products (product_name, department_id, price, stock_quantity)
	VALUES ("500 watt Stereo Receiver", 4, 199.99, 250);
INSERT INTO products (product_name, department_id, price, stock_quantity)
	VALUES ("47.5 cu.ft. Refrigerator/Freezer", 1, 379.48, 100);
INSERT INTO products (product_name, department_id, price, stock_quantity)
	VALUES ("1200 watt Microwave Oven", 1, 127.99, 250);
INSERT INTO products (product_name, department_id, price, stock_quantity)
	VALUES ("Heavy Duty Kitchen Mixer", 1, 234.99, 60);
INSERT INTO products (product_name, department_id, price, stock_quantity)
	VALUES ("42 pc. Stainless Flatware", 3, 34.99, 750);
INSERT INTO products (product_name, department_id, price, stock_quantity)
	VALUES ("11x17 Brass Picture Frame", 3, 17.98, 100);
INSERT INTO products (product_name, department_id, price, stock_quantity)
	VALUES ("Men's Large Raincoat", 2, 49.99, 200);
INSERT INTO products (product_name, department_id, price, stock_quantity)
	VALUES ("Women's Large Raincoat", 2, 49.99, 300);
INSERT INTO products (product_name, department_id, price, stock_quantity)
	VALUES ("Child's Raincoat", 2, 19.99, 500);