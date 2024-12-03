const express = require('express');
const sql = require('mssql');
const moment = require('moment');
const path = require('path');
const fs = require('fs');
const router = express.Router();
const getHeader = require('./header');

router.get('/', function (req, res) {
    res.setHeader('Content-Type', 'text/html');
    res.write("<title>YOUR NAME Grocery</title>");
    res.write(getHeader()); // Include the header
    res.write("<h1>Product Search</h1>");
    (async function () {
        try {
            // Connect to the database
            let pool = await sql.connect(dbConfig);
            res.write('<h1>Order Summaries</h1>');

            // Query for order summaries
            let ordersQuery = `
                SELECT 
                    o.orderId, 
                    o.orderDate, 
                    o.totalAmount, 
                    c.firstName + ' ' + c.lastName AS customerName,
                    c.address, c.city, c.state, c.country
                FROM ordersummary o
                INNER JOIN customer c ON o.customerId = c.customerId
                ORDER BY o.orderId ASC
            `;
            let ordersResults = await pool.request().query(ordersQuery);

            // Loop through each order
            for (let order of ordersResults.recordset) {
                res.write(`<h2>Order ID: ${order.orderId}</h2>`);
                res.write(`<p>Order Date: ${moment(order.orderDate).format('MMMM Do YYYY, h:mm:ss a')}</p>`);
                res.write(`<p>Customer: ${order.customerName}</p>`);
                res.write(`<p>Address: ${order.address}, ${order.city}, ${order.state}, ${order.country}</p>`);
                res.write(`<p>Total Amount: $${order.totalAmount.toFixed(2)}</p>`);

                // Query for products in the current order
                let productsQuery = `
                    SELECT 
                        p.productId, 
                        p.productName, 
                        op.quantity, 
                        op.price, 
                        (op.quantity * op.price) AS total
                    FROM orderproduct op
                    INNER JOIN product p ON op.productId = p.productId
                    WHERE op.orderId = @orderId
                `;
                let productsResults = await pool.request()
                    .input('orderId', sql.Int, order.orderId)
                    .query(productsQuery);

                // Display the products in a grid
                res.write('<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 20px;">');
                for (let product of productsResults.recordset) {
                    // Check for multiple image file types
                    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif'];
                    let productImage = '/images/jerseys/default.jpg'; 
                    let baseDir = path.resolve(__dirname, '..', 'public', 'images', 'jerseys');

                    for (const ext of imageExtensions) {
                        const imagePath = path.join(baseDir, `${product.productId}.${ext}`);
                        if (fs.existsSync(imagePath)) {
                            productImage = `/images/jerseys/${product.productId}.${ext}`;
                            break;
                        }
                    }

                    res.write(`
                        <div style="border: 1px solid #ccc; padding: 10px; text-align: center;">
                            <img src="${productImage}" alt="${product.productName}" style="width: 100%; height: auto;">
                            <p>${product.productName}</p>
                            <p>Quantity: ${product.quantity}</p>
                            <p>Price: $${product.price.toFixed(2)}</p>
                            <p>Total: $${product.total.toFixed(2)}</p>
                        </div>
                    `);
                }
                res.write('</div>');
                res.write('<hr>'); // Separator between orders
            }

            res.end();
        } catch (err) {
            console.error("Error retrieving data from SQL:", err);
            if (!res.headersSent) {
                res.status(500).send(`<p>Error retrieving orders: ${err.message}</p>`);
            }
        }
    })();
});

module.exports = router;