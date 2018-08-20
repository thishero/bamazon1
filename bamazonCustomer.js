require('console.table');
var mysql = require('mysql');
var inquirer = require('inquirer');


// Initializes the connection variable to sync with a MySQL database
var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
  
    // Your username
    user: "root",
  
    // Your password
    password: "",
    database: "bamazon"
  });
  
  // Creates the connection with the server and loads the product data upon a successful connection
  connection.connect(function(err) {
    if (err) {
      console.error("error connecting: " + err.stack);
    }
    loadProducts();
  });

  function loadProducts() {
    // Select all of the data from the mysql products table
    connection.query("SELECT * FROM products", function(err, res) {
    if (err) throw err;
    console.table(res);
    promptCustomerForItem(res);
    })
  };

    function promptCustomerForItem() {
        inquirer
            .prompt([
                {
                    type: "input",
                    name: "choice",
                    message: "what is the id of the item you would like to purchase? [Quit with the letter Q]",
                    validate: function(val) {
                        return !isNaN(val) || val.toLowerCase() === "q";
                    }
                }
            ]).then(function(val) {
                checkIfShouldExit(val.choice)
                var choiceID = parseInt(val.choice);
                var product = checkInventory(choiceID, inventory);

                if (product) {
                    promptCustomerForQuantity(product)
                } else {
                    console.log("That item is not in the inventory");
                    loadProducts();
                }
            });
    };


// Prompt the customer for a product quantity
function promptCustomerForQuantity(product) {
    inquirer
      .prompt([
        {
          type: "input",
          name: "quantity",
          message: "How many would you like? [Quit with Q]",
          validate: function(val) {
            return val > 0 || val.toLowerCase() === "q";
          }
        }
      ])
      .then(function(val) {
        // Check if the user wants to quit the program
        checkIfShouldExit(val.quantity);
        var quantity = parseInt(val.quantity);
  
        // If there isn't enough of the chosen product and quantity, let the user know and re-run loadProducts
        if (quantity > product.stock_quantity) {
          console.log("Insufficient quantity!");
          loadProducts();
        }
        else {
          // Otherwise run makePurchase, give it the product information and desired quantity to purchase
          makePurchase(product, quantity);
        }
      });
}



        function checkInventory(choiceID, inventory) {
            for (var i = 0; i<inventory.length; i++) {
                if (inventory[i].item_id === choiceID) {
                    return inventory[i];
                }
            }
            return null;
        };

        function checkIfShouldExit(choice) {
            if (choice.toLowerCase() === "q") {
                console.log("Goodbye!");
                process.exit(0);
            }
        };


        function makePurchase() {
            // if your input is less than the local inventory, you can make the purchase
            connection.query("SELECT * FROM products UPDATE stock_quantity SET stock_quantity = ", function(err, res) {
                if (err) throw err;
                console.table(res);
            });
        }