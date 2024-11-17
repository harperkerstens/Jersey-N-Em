const express = require('express');
const router = express.Router();
const sql = require('mssql');
const moment = require('moment');

router.get('/', async function(req, res) {
    res.setHeader('Content-Type', 'text/html');
    res.write("<title>YOUR NAME Grocery Order Processing</title>");
    res.write("<h1>Order Processing</h1>");

    let productList = req.session.productList || []; // Shopping cart stored in session
    const customerId = req.query.customerId; // Get customerId from query parameters

    // Validate customer ID
    if (!customerId || isNaN(customerId)) {
        res.write("<p>Error: Invalid Customer ID. Please enter a valid number.</p>");
        res.end();
        return;
    }

    // Validate that there are items in the cart
    if (productList.length === 0) {
        res.write("<p>Error: Your shopping cart is empty. Add items to your cart before placing an order.</p>");
        res.end();
        return;
    }

    try {
        // Connect to the database
        const pool = await sql.connect(dbConfig);

        // Validate if customer exists
        const customerCheckQuery = `
            SELECT customerId, firstName, lastName, address 
            FROM dbo.customer 
            WHERE customerId = @customerId
        `;
        const customerResult = await pool.request()
            .input('customerId', sql.Int, customerId)
            .query(customerCheckQuery);

        if (customerResult.recordset.length === 0) {
            res.write(`<p>Error: Customer with ID ${customerId} does not exist.</p>`);
            res.end();
            return;
        }

        const customer = customerResult.recordset[0];

        // Insert into OrderSummary and retrieve the auto-generated orderId
        const orderDate = moment().format('YYYY-MM-DD');
        const orderSummaryQuery = `
            INSERT INTO dbo.ordersummary (customerId, orderDate, totalAmount)
            OUTPUT INSERTED.orderId
            VALUES (@customerId, @orderDate, 0) -- Initial totalAmount as 0
        `;

        const orderSummaryResult = await pool.request()
            .input('customerId', sql.Int, customerId)
            .input('orderDate', sql.Date, orderDate)
            .query(orderSummaryQuery);

        const newOrderId = orderSummaryResult.recordset[0].orderId;

        // Insert each item into orderproduct table
        let totalAmount = 0;
        const orderedProductQuery = `
            INSERT INTO dbo.orderproduct (orderId, productId, quantity, price)
            VALUES (@orderId, @productId, @quantity, @price)
        `;

        for (const product of productList) {            
            if (!product) {
                // console.log("NULL Product SKIP: " + JSON.stringify(product));
                continue; // Skip null or undefined products or invalid prices
            } else {
                console.log("Product: " + JSON.stringify(product));
            }

            const { id: productId, quantity, price } = product;
            totalAmount += product.quantity * product.price;

            await pool.request()
                .input('orderId', sql.Int, newOrderId)
                .input('productId', sql.Int, product.id)
                .input('quantity', sql.Int, product.quantity)
                .input('price', sql.Decimal(10, 2), product.price)
                .query(orderedProductQuery);
        }

        // Update totalAmount in OrderSummary
        const updateOrderTotalQuery = `
            UPDATE dbo.ordersummary
            SET totalAmount = @totalAmount
            WHERE orderId = @orderId
        `;
        await pool.request()
            .input('totalAmount', sql.Decimal(10, 2), totalAmount)
            .input('orderId', sql.Int, newOrderId)
            .query(updateOrderTotalQuery);

        // Display the order summary
        res.write("<h2>Order Summary</h2>");
        res.write(`<p>Order ID: ${newOrderId}</p>`);
        res.write(`<p>Order Date: ${moment().format('MMMM Do YYYY, h:mm:ss a')}</p>`);
        res.write(`<p>Customer: ${customer.firstName} ${customer.lastName}</p>`);
        res.write(`<p>Address: ${customer.address}</p>`);
        res.write("<ul>");
        for (const product of productList) {
            if (!product || typeof product.price !== 'number') continue; // Skip null or undefined products or invalid prices

            const { name, quantity, price } = product;            
            const subtotal = (quantity * price).toFixed(2);
            res.write(`<li>${name} - Quantity: ${quantity}, Price: $${price.toFixed(2)}, Subtotal: $${subtotal}</li>`);
        }
        res.write("</ul>");
        res.write(`<p><strong>Total Amount:</strong> $${totalAmount.toFixed(2)}</p>`);

        // Clear the shopping cart        
        req.session.productList = [];        
        res.end();

    } catch (err) {
        console.error("Database error:", err);
        if (!res.headersSent) {
            res.status(500).send("<p>An error occurred while processing your order. Please try again later.</p>");
        }
    }
});

module.exports = router;
