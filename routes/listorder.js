const express = require('express');
const sql = require('mssql');
const moment = require('moment');
// const app = express();
const router = express.Router();

// userName: 'sa',
// password: '304#sa#pw'

// Global database configuration
// const dbConfig = {
//     server: 'localhost',
//     database: 'orders',
//     authentication: {
//         type: 'default',
//         options: {
//             userName: 'harper',
//             password: 'harper'
//         }
//     },
//     options: {
//         encrypt: false,
//         enableArithAbort: false,
//         trustServerCertificate: true
//     }
// };

router.get('/', function (req, res) {
    res.setHeader('Content-Type', 'text/html');

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
                        p.productName, 
                        op.quantity, 
                        op.price, 
                        (op.quantity * op.price) AS total
                    FROM orderproduct op
                    INNER JOIN product p ON op.productId = p.productId
                    WHERE op.orderId = ${order.orderId}
                `;
                let productsResults = await pool.request().query(productsQuery);

                // Display the products in a list
                res.write('<ul>');
                for (let product of productsResults.recordset) {
                    res.write(`<li>Product: ${product.productName} - Quantity: ${product.quantity} - Price: $${product.price.toFixed(2)} - Total: $${product.total.toFixed(2)}</li>`);
                }
                res.write('</ul>');
                res.write('<hr>'); // Separator between orders
            }

            res.end();
        } catch (err) {
            console.error("Error retrieving data from SQL:", err);
            res.status(500).send(`<p>Error retrieving orders: ${err.message}</p>`);
        }
    })();
});

// app.listen(3000, () => {
//     console.log('Server running on http://localhost:3000');
// });

module.exports = router;