const express = require('express');
const router = express.Router();
const sql = require('mssql');
const path = require('path');
const fs = require('fs');
const getHeader = require('./header');

router.get('/', async function (req, res) {
    if (!req.session.authenticatedUser) {
        req.session.current_url = req.originalUrl;
        return res.redirect('/login');
    }

    const userId = req.session.authenticatedUser.userid;

    try {
        const pool = await sql.connect(req.dbConfig);
        const request = pool.request();
        request.input('userId', sql.NVarChar, userId);

        const customerQuery = `
            SELECT * FROM dbo.customer 
            WHERE userid = @userId
        `;
        const customerResult = await request.query(customerQuery);

        if (customerResult.recordset.length === 1) {
            const customer = customerResult.recordset[0];

            const customerDataHtml = `
                <html>
                <head>
                    <title>Customer Profile</title>
                    <style>
                        table { width: 50%; margin: auto; border-collapse: collapse; margin-top: 20px; }
                        th, td { border: 1px solid #ddd; padding: 8px; }
                        th { background-color: #f2f2f2; }
                        nav { text-align: center; margin-bottom: 20px; }
                        nav a { margin: 0 15px; text-decoration: none; color: #000; }
                        .hidden { display: none; }
                        .center { text-align: center; }
                        .large-button { font-size: 18px; padding: 10px 20px; margin-top: 20px; }
                        .button { font-size: 18px; padding: 10px 20px; margin-top: 20px; }
                    </style>
                    <script>
                        function enableEdit() {
                            document.querySelectorAll('.editable').forEach(el => el.disabled = false);
                            document.getElementById('updateButton').classList.remove('hidden');
                            document.getElementById('editButton').classList.add('hidden');
                        }
                    </script>
                </head>
                <body>
                    ${getHeader()}
                    <form method="POST" action="/customer/update">
                        <table>
                            <tr><th>Field</th><th>Data</th><th>Edit</th></tr>
                            ${Object.keys(customer).map(key => `
                                <tr>
                                    <td>${key}</td>
                                    <td>${customer[key]}</td>
                                    <td>
                                        ${key === 'customerId' || key === 'userid' || key === 'password' ? '' : `<input type="text" name="${key}" value="${customer[key]}" class="editable" disabled>`}
                                    </td>
                                </tr>
                            `).join('')}
                        </table>
                        <div id="passwordFields" class="hidden center">
                            <label>New Password: <input type="password" name="password"></label>
                            <label>Confirm Password: <input type="password" name="confirmPassword"></label>
                        </div>
                        <div class="center">
                            <button type="button" id="editButton" class="button" onclick="enableEdit()">Edit</button>
                            <button type="submit" id="updateButton" class="button hidden">Update</button>
                        </div>
                    </form>
                    <div class="center">
                        <button class="large-button" onclick="window.location.href='/customer/orders'">View Orders</button>
                    </div>
                </body>
                </html>
            `;
            res.send(customerDataHtml);
        } else {
            res.status(404).send(`<p>Customer not found.</p>`);
        }
    } catch (err) {
        console.error("Error retrieving customer information:", err);
        res.status(500).send(`<p>Error retrieving customer information: ${err.message}</p>`);
    }
});

router.post('/update', async function (req, res) {
    if (!req.session.authenticatedUser) {
        req.session.current_url = req.originalUrl;
        return res.redirect('/login');
    }

    const userId = req.session.authenticatedUser.userid;
    const { firstName, lastName, phonenum, email, address, city, state, postalCode, country, password, confirmPassword } = req.body;

    if (password && password !== confirmPassword) {
        const errorHtml = `
            <html>
            <head>
                <title>Error</title>
                <style>
                    .center { text-align: center; margin-top: 50px; }
                    .large-text { font-size: 24px; color: red; }
                    button { margin: 10px; padding: 10px 20px; }
                </style>
            </head>
            <body>
                <div class="center">
                    <p class="large-text">Passwords do not match.</p>
                    <button onclick="window.location.href='/customer'">View Customer Information</button>
                </div>
            </body>
            </html>
        `;
        return res.send(errorHtml);
    }

    try {
        const pool = await sql.connect(req.dbConfig);
        const request = pool.request();
        request.input('userId', sql.NVarChar, userId);

        // Check for unique phone number and email
        const uniqueCheckQuery = `
            SELECT * FROM dbo.customer 
            WHERE (phonenum = @phonenum OR email = @Email) 
            AND userid != @userId
        `;
        request.input('phonenum', sql.NVarChar, phonenum);
        request.input('email', sql.NVarChar, email);

        const uniqueCheckResult = await request.query(uniqueCheckQuery);

        if (uniqueCheckResult.recordset.length > 0) {
            return res.status(400).send(`<p>Phone number or email already in use.</p>`);
        }

        // Update user information
        const updateQuery = `
            UPDATE dbo.customer 
            SET firstName = @firstName, lastName = @lastName, phonenum = @phonenum, email = @Email, 
                address = @address, city = @city, state = @state, postalCode = @postalCode, country = @country
            ${password ? ', password = @Password' : ''}
            WHERE userid = @userId
        `;
        request.input('firstName', sql.NVarChar, firstName);
        request.input('lastName', sql.NVarChar, lastName);
        request.input('address', sql.NVarChar, address);
        request.input('city', sql.NVarChar, city);
        request.input('state', sql.NVarChar, state);
        request.input('postalCode', sql.NVarChar, postalCode);
        request.input('country', sql.NVarChar, country);
        request.input('Password', sql.NVarChar, password);

        await request.query(updateQuery);

        const successHtml = `
            <html>
            <head>
                <title>Update Successful</title>
                <style>
                    .center { text-align: center; margin-top: 50px; }
                    .large-text { font-size: 24px; }
                    button { margin: 10px; padding: 10px 20px; }
                </style>
            </head>
            <body>
                <div class="center">
                    <p class="large-text">Customer information updated successfully.</p>
                    <button onclick="window.location.href='/'">Go to Main Screen</button>
                    <button onclick="window.location.href='/customer'">View Customer Information</button>
                </div>
            </body>
            </html>
        `;
        res.send(successHtml);
    } catch (err) {
        console.error("Error updating customer information:", err);
        res.status(500).send(`<p>Error updating customer information: ${err.message}</p>`);
    }
});

router.get('/orders', async function (req, res) {
    if (!req.session.authenticatedUser) {
        req.session.current_url = req.originalUrl;
        return res.redirect('/login');
    }

    const userId = req.session.authenticatedUser.userid;

    try {
        const pool = await sql.connect(req.dbConfig);
        const request = pool.request();
        request.input('userId', sql.NVarChar, userId);

        const customerQuery = `
            SELECT * FROM dbo.customer 
            WHERE userid = @userId
        `;
        const customerResult = await request.query(customerQuery);

        if (customerResult.recordset.length === 1) {
            const customer = customerResult.recordset[0];

            const ordersQuery = `
                SELECT o.orderId, o.orderDate, o.totalAmount, p.productName, op.quantity, op.price, p.productId
                FROM dbo.ordersummary o
                JOIN dbo.orderproduct op ON o.orderId = op.orderId
                JOIN dbo.product p ON op.productId = p.productId
                WHERE o.customerId = @customerId
                ORDER BY o.orderDate DESC
            `;
            request.input('customerId', sql.Int, customer.customerId);
            const ordersResult = await request.query(ordersQuery);

            const ordersByOrderId = ordersResult.recordset.reduce((acc, order) => {
                if (!acc[order.orderId]) {
                    acc[order.orderId] = {
                        orderId: order.orderId,
                        orderDate: order.orderDate,
                        totalAmount: order.totalAmount,
                        products: []
                    };
                }
                acc[order.orderId].products.push(order);
                return acc;
            }, {});

            const ordersHtml = `
                <html>
                <head>
                    <title>Order History for ${customer.firstName} ${customer.lastName}</title>
                    <style>
                        table { width: 80%; margin: auto; border-collapse: collapse; margin-top: 20px; }
                        th, td { border: 1px solid #ddd; padding: 8px; }
                        th { background-color: #f2f2f2; }
                        nav { text-align: center; margin-bottom: 20px; }
                        nav a { margin: 0 15px; text-decoration: none; color: #000; }
                        .center { text-align: center; }
                        .button { font-size: 18px; padding: 10px 20px; margin-top: 20px; }
                        .order-section { margin-bottom: 40px; border: 1px solid #ccc; padding: 20px; }
                        .product-image { width: 100%; height: auto; }
                    </style>
                </head>
                <body>
                    ${getHeader()}
                    <div class="center">
                        <h1>Order History for ${customer.firstName} ${customer.lastName}</h1>
                        <button class="button" onclick="window.location.href='/customer'">View Customer Information</button>
                    </div>
                    ${Object.values(ordersByOrderId).map(order => `
                        <div class="order-section">
                            <h2>Order ID: ${order.orderId}</h2>
                            <p>Order Date: ${new Date(order.orderDate).toLocaleString()}</p>
                            <p>Total Amount: $${order.totalAmount.toFixed(2)}</p>
                            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 20px;">
                                ${order.products.map(product => {
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

                                    return `
                                        <div style="border: 1px solid #ccc; padding: 10px; text-align: center;">
                                            <img src="${productImage}" alt="${product.productName}" class="product-image">
                                            <p>${product.productName}</p>
                                            <p>Quantity: ${product.quantity}</p>
                                            <p>Price: $${product.price.toFixed(2)}</p>
                                            <p>Total: $${(product.quantity * product.price).toFixed(2)}</p>
                                        </div>
                                    `;
                                }).join('')}
                            </div>
                        </div>
                    `).join('')}
                </body>
                </html>
            `;
            res.send(ordersHtml);
        } else {
            res.status(404).send(`<p>Customer not found.</p>`);
        }
    } catch (err) {
        console.error("Error retrieving orders:", err);
        res.status(500).send(`<p>Error retrieving orders: ${err.message}</p>`);
    }
});

module.exports = router;
