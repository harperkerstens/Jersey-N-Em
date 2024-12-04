const express = require('express');
const router = express.Router();
const sql = require('mssql');
const getHeader = require('./header');
const chartJsCdn = 'https://cdn.jsdelivr.net/npm/chart.js';
const fs = require('fs');
const formidable = require('formidable'); // Add this line
const path = require('path'); // Add this line

// Function to generate the admin dashboard button
function getAdminDashboardButton() {
    return `
        <div style="text-align: center; margin-top: 20px;">
            <button onclick="location.href='/admin'" style="padding: 10px 20px; font-size: 16px; background-color: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer;">Admin Dashboard</button>
        </div>
    `;
}

// Initial admin page with three buttons
router.get('/', function (req, res) {
    if (!req.session.authenticatedUser) {
        req.session.current_url = req.originalUrl;
        return res.redirect('/login');
    }

    const adminPageHtml = `
        <html>
        <head>
            <title>Admin Page</title>
            <style>
                body { background-color: black; color: white; font-family: Arial, sans-serif; text-align: center; margin-top: 50px; }
                .button-container { display: flex; justify-content: center; gap: 20px; }
                button { padding: 20px 40px; font-size: 20px; background-color: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer; }
                button:hover { background-color: #0056b3; }
            </style>
        </head>
        <body>
            ${getHeader()}
            <h1>Admin Dashboard</h1>
            <div class="button-container">
                <button onclick="location.href='/admin/customers'">List Customers</button>
                <button onclick="location.href='/admin/sales-report'">Sales Report</button>
                <button onclick="location.href='/admin/add-edit-products'">Add/Edit Products</button>
                <button onclick="location.href='/admin/restore-database'">Restore Database</button>
            </div>
        </body>
        </html>
    `;
    res.send(adminPageHtml);
});

// List Customers page
router.get('/customers', async function (req, res) {
    if (!req.session.authenticatedUser) {
        req.session.current_url = req.originalUrl;
        return res.redirect('/login');
    }

    try {
        const pool = await sql.connect(req.dbConfig);
        const request = pool.request();

        const query = `
            SELECT 
                customerId, firstName, lastName, email, phonenum, address, city, state, postalCode, country, userid 
            FROM customer
        `;

        const result = await request.query(query);

        const customersHtml = `
            <html>
            <head>
                <title>Customer List</title>
                <style>
                    body { background-color: black; color: white; font-family: Arial, sans-serif; }
                    table { width: 80%; margin: auto; border-collapse: collapse; margin-top: 20px; color: white; }
                    th, td { border: 1px solid #ddd; padding: 8px; }
                    th { background-color: #333; }
                    nav { text-align: center; margin-bottom: 20px; }
                    nav a { margin: 0 15px; text-decoration: none; color: #007bff; }
                </style>
            </head>
            <body>
                ${getHeader()}
                ${getAdminDashboardButton()}
                <table>
                    <tr>
                        <th>Customer ID</th>
                        <th>First Name</th>
                        <th>Last Name</th>
                        <th>Email</th>
                        <th>Phone Number</th>
                        <th>Address</th>
                        <th>City</th>
                        <th>State</th>
                        <th>Postal Code</th>
                        <th>Country</th>
                        <th>User ID</th>
                    </tr>
                    ${result.recordset.map(row => `
                        <tr>
                            <td>${row.customerId}</td>
                            <td>${row.firstName}</td>
                            <td>${row.lastName}</td>
                            <td>${row.email}</td>
                            <td>${row.phonenum}</td>
                            <td>${row.address}</td>
                            <td>${row.city}</td>
                            <td>${row.state}</td>
                            <td>${row.postalCode}</td>
                            <td>${row.country}</td>
                            <td>${row.userid}</td>
                        </tr>
                    `).join('')}
                </table>
            </body>
            </html>
        `;

        res.send(customersHtml);
    } catch (err) {
        console.error("Error retrieving customer list:", err);
        res.status(500).send(`<p>Error retrieving customer list: ${err.message}</p>`);
    }
});

// Sales Report page
router.get('/sales-report', async function (req, res) {
    if (!req.session.authenticatedUser) {
        req.session.current_url = req.originalUrl;
        return res.redirect('/login');
    }

    try {
        const pool = await sql.connect(req.dbConfig);
        const request = pool.request();

        const query = `
            SELECT 
                CONVERT(VARCHAR, orderDate, 23) AS orderDate, 
                SUM(totalAmount) AS totalOrderAmount 
            FROM dbo.ordersummary 
            GROUP BY CONVERT(VARCHAR, orderDate, 23)
            ORDER BY orderDate
        `;

        const result = await request.query(query);

        const salesReportHtml = `
            <html>
            <head>
                <title>Administrator Sales Report by Day</title>
                <style>
                    body { background-color: black; color: white; font-family: Arial, sans-serif; }
                    table { width: 50%; margin: auto; border-collapse: collapse; margin-top: 20px; color: white; }
                    th, td { border: 1px solid #ddd; padding: 8px; }
                    th { background-color: #333; }
                    nav { text-align: center; margin-bottom: 20px; }
                    nav a { margin: 0 15px; text-decoration: none; color: #007bff; }
                    #salesChart { display: none; width: 1509px; height: 754px; margin: auto; margin-top: 20px; }
                    #toggleButton { display: block; margin: 20px auto; padding: 10px 20px; font-size: 16px; background-color: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer; }
                    #toggleButton:hover { background-color: #0056b3; }
                </style>
                <script src="${chartJsCdn}"></script>
                <script>
                    let chartInstance;

                    function toggleGraph() {
                        const chart = document.getElementById('salesChart');
                        if (chart.style.visibility === 'hidden') {
                            chart.style.visibility = 'visible';
                            chart.style.opacity = 1; // Make it fully visible
                        } else {
                            chart.style.visibility = 'hidden';
                            chart.style.opacity = 0; // Make it fully invisible
                        }
                    }

                    window.onload = function() {
                        const canvas = document.getElementById('salesChart');
                        
                        // Set fixed width and height to prevent resizing
                        canvas.width = 1509;
                        canvas.height = 754;

                        const ctx = canvas.getContext('2d');
                        chartInstance = new Chart(ctx, {
                            type: 'line',
                            data: {
                                labels: ${JSON.stringify(result.recordset.map(row => row.orderDate))},
                                datasets: [{
                                    label: 'Total Order Amount',
                                    data: ${JSON.stringify(result.recordset.map(row => row.totalOrderAmount))},
                                    borderColor: 'rgba(75, 192, 192, 1)',
                                    borderWidth: 1,
                                    fill: false
                                }]
                            },
                            options: {
                                maintainAspectRatio: false, // Disable aspect ratio maintenance
                                responsive: false,         // Disable responsiveness
                                scales: {
                                    x: { title: { display: true, text: 'Order Date' } },
                                    y: { title: { display: true, text: 'Total Order Amount' } }
                                }
                            }
                        });
                    }
                </script>
            </head>
            <body>
                ${getHeader()}
                ${getAdminDashboardButton()}
                <table>
                    <tr><th>Order Date</th><th>Total Order Amount</th></tr>
                    ${result.recordset.map(row => `
                        <tr>
                            <td>${row.orderDate}</td>
                            <td>${row.totalOrderAmount}</td>
                        </tr>
                    `).join('')}
                </table>
                <button id="toggleButton" onclick="toggleGraph()">Toggle Graph</button>
                <canvas id="salesChart"></canvas>
            </body>
            </html>
        `;

        res.send(salesReportHtml);
    } catch (err) {
        console.error("Error retrieving sales report:", err);
        res.status(500).send(`<p>Error retrieving sales report: ${err.message}</p>`);
    }
});

// Add/Edit Products page
router.get('/add-edit-products', function (req, res) {
    if (!req.session.authenticatedUser) {
        req.session.current_url = req.originalUrl;
        return res.redirect('/login');
    }

    const addEditProductsHtml = `
        <html>
        <head>
            <title>Add/Edit Products</title>
            <style>
                body { background-color: black; color: white; font-family: Arial, sans-serif; text-align: center; margin-top: 50px; }
                .button-container { display: flex; justify-content: center; gap: 20px; }
                button { padding: 20px 40px; font-size: 20px; background-color: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer; }
                button:hover { background-color: #0056b3; }
            </style>
        </head>
        <body>
            ${getHeader()}
            ${getAdminDashboardButton()}
            <h1>Add/Edit Products</h1>
            <div class="button-container">
                <button onclick="location.href='/admin/add-jersey'">Add Jersey</button>
                <button onclick="location.href='/admin/edit-jersey'">Edit Jersey</button>
            </div>
        </body>
        </html>
    `;
    res.send(addEditProductsHtml);
});

// Add Jersey page
router.get('/add-jersey', function (req, res) {
    if (!req.session.authenticatedUser) {
        req.session.current_url = req.originalUrl;
        return res.redirect('/login');
    }

    const addJerseyHtml = `
        <html>
        <head>
            <title>Add Jersey</title>
            <style>
                body { background-color: black; color: white; font-family: Arial, sans-serif; text-align: center; margin-top: 50px; }
                form { display: inline-block; text-align: left; }
                label { display: block; margin-top: 10px; }
                input, select { width: 100%; padding: 8px; margin-top: 5px; }
                button { margin-top: 20px; padding: 10px 20px; font-size: 16px; background-color: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer; }
                button:hover { background-color: #0056b3; }
            </style>
        </head>
        <body>
            ${getHeader()}
            ${getAdminDashboardButton()}
            <h1>Add Jersey</h1>
            <form action="/admin/add-jersey" method="post" enctype="multipart/form-data">
                <label for="productName">Product Name:</label>
                <input type="text" id="productName" name="productName" required>
                
                <label for="productPrice">Product Price:</label>
                <input type="number" id="productPrice" name="productPrice" step="0.01" required>
                
                <label for="productDesc">Product Description:</label>
                <textarea id="productDesc" name="productDesc" required></textarea>
                
                <label for="categoryId">Player Status:</label>
                <select id="categoryId" name="categoryId" required>
                    <option value="1">Current</option>
                    <option value="2">Historic</option>
                </select>
                
                <label for="teamId">Team:</label>
                <select id="teamId" name="teamId" required>
                    <option value="1">Warriors</option>
                    <option value="2">Lakers</option>
                    <option value="3">Bulls</option>
                    <option value="4">Celtics</option>
                    <option value="5">Nets</option>
                    <option value="6">Bucks</option>
                    <option value="7">Spurs</option>
                    <option value="8">Mavericks</option>
                    <option value="9">76ers</option>
                    <option value="10">Nuggets</option>
                    <option value="11">Suns</option>
                    <option value="12">Heat</option>
                    <option value="13">Hawks</option>
                    <option value="14">Hornets</option>
                    <option value="15">Pistons</option>
                    <option value="16">Pacers</option>
                    <option value="17">Raptors</option>
                    <option value="18">Magic</option>
                    <option value="19">Wizards</option>
                    <option value="20">Cavaliers</option>
                    <option value="21">Timberwolves</option>
                    <option value="22">Pelicans</option>
                    <option value="23">Kings</option>
                    <option value="24">Jazz</option>
                    <option value="25">Thunder</option>
                    <option value="26">Rockets</option>
                    <option value="27">Knicks</option>
                    <option value="28">Clippers</option>
                    <option value="29">Grizzlies</option>
                    <option value="30">Blazers</option>
                </select>
                
                <label for="productImage">Product Image (.jpg):</label>
                <input type="file" id="productImage" name="productImage" accept=".jpg" required>
                
                <button type="submit">Add Jersey</button>
            </form>
        </body>
        </html>
    `;
    res.send(addJerseyHtml);
});

async function saveJersey(dbConfig, files, productName, productPrice, productDesc, categoryId, teamId) {
    try {
        const pool = await sql.connect(dbConfig);
        const request = pool.request();

        const result = await request.query("SELECT MAX(productId) AS maxProductId FROM product");
        const newProductId = result.recordset[0].maxProductId + 1;

        await request.query(`
            SET IDENTITY_INSERT product ON;
            INSERT INTO product (productId, productName, productPrice, productDesc, categoryId, teamId)
            VALUES (${newProductId}, '${productName}', ${productPrice}, '${productDesc}', ${categoryId}, ${teamId});
            SET IDENTITY_INSERT product OFF;
        `);

        // Ensure the directory exists
        const dir = './public/images/jerseys';
        if (!fs.existsSync(dir)){
            fs.mkdirSync(dir, { recursive: true });
        }

        // Copy the uploaded file to the new location
        const oldPath = files.productImage[0].filepath; // Fix the file path handling
        const newPath = path.join(dir, `${newProductId}.jpg`); // Fix the file path handling
        fs.copyFileSync(oldPath, newPath); // Create a copy of the file
    } catch (err) {
        console.error("Error adding jersey:", err);
        throw err;
    }
}

router.post('/add-jersey', async function (req, res) {
    if (!req.session.authenticatedUser) {
        req.session.current_url = req.originalUrl;
        return res.redirect('/login');
    }

    const form = new formidable.IncomingForm();
    form.parse(req, async (err, fields, files) => {
        if (err) {
            console.error("Error parsing form:", err);
            return res.status(500).send("Error parsing form");
        }

        console.log("Files:", files); // Debugging line to view uploaded file details

        try {
            // const pool = await sql.connect(req.dbConfig);
            // const request = pool.request();

            // const result = await request.query("SELECT MAX(productId) AS maxProductId FROM product");
            // const newProductId = result.recordset[0].maxProductId + 1;

            const { productName, productPrice, productDesc, categoryId, teamId } = fields;
            await saveJersey(req.dbConfig, files, productName, productPrice, productDesc, categoryId, teamId);

            // await request.query(`
            //     SET IDENTITY_INSERT product ON;
            //     INSERT INTO product (productId, productName, productPrice, productDesc, categoryId, teamId)
            //     VALUES (${newProductId}, '${productName}', ${productPrice}, '${productDesc}', ${categoryId}, ${teamId});
            //     SET IDENTITY_INSERT product OFF;
            // `);

            // // Ensure the directory exists
            // const dir = './public/images/jerseys';
            // if (!fs.existsSync(dir)){
            //     fs.mkdirSync(dir, { recursive: true });
            // }

            // // Copy the uploaded file to the new location
            // const oldPath = files.productImage[0].filepath; // Fix the file path handling
            // const newPath = path.join(dir, `${newProductId}.jpg`); // Fix the file path handling
            // fs.copyFileSync(oldPath, newPath); // Create a copy of the file

            res.redirect('/admin/add-edit-products');
        } catch (err) {
            console.error("Error adding jersey:", err);
            res.status(500).send("Error adding jersey");
        }
    });
});

// Edit Jersey page
router.get('/edit-jersey', async function (req, res) {
    if (!req.session.authenticatedUser) {
        req.session.current_url = req.originalUrl;
        return res.redirect('/login');
    }

    res.setHeader('Content-Type', 'text/html');
    res.write("<title>Edit Jersey</title>");
    res.write("<style>body { background-color: black; color: white; font-family: Arial, sans-serif; }</style>");
    res.write(getHeader());
    res.write("<h1>Edit Jersey</h1>");

    // Display the search form
    res.write(`
        <form method="GET" action="/admin/edit-jersey" style="display: flex; align-items: center; justify-content: center; margin-bottom: 20px;">
            <label for="productName" style="margin-right: 10px;">Search for a jersey:</label>
            <input type="text" id="productName" name="productName" style="flex-grow: 1; padding: 10px; font-size: 16px;">
            <button type="submit" style="margin-left: 10px; padding: 10px 20px; font-size: 16px; background-color: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer;">Search</button>
        </form>
        <hr>
    `);

    // Get the product name from query parameters
    const name = req.query.productName;

    try {
        const pool = await sql.connect(req.dbConfig);
        const request = pool.request();

        let query;
        if (name) {
            query = `
                SELECT 
                    productId, 
                    productName, 
                    productPrice 
                FROM dbo.product 
                WHERE productName LIKE '%' + @productName + '%'
            `;
            request.input('productName', sql.NVarChar, name);
        } else {
            query = `
                SELECT 
                    productId, 
                    productName, 
                    productPrice 
                FROM dbo.product
            `;
        }

        const result = await request.query(query);

        if (name) {
            res.write(`<h2>Search Results for "${name}":</h2>`);
        } else {
            res.write("<h2>All Jerseys:</h2>");
        }

        if (result.recordset.length === 0) {
            res.write(`<p>No jerseys found${name ? ` for "${name}"` : ""}.</p>`);
        } else {
            res.write('<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 20px; color: white;">');
            for (const product of result.recordset) {
                const formattedPrice = product.productPrice.toFixed(2);
                const editLink = `/admin/editprod?id=${product.productId}`;

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
                    <div style="border: 1px solid #ccc; padding: 10px; text-align: center; background-color: white; color: black;">
                        <a href="${editLink}">
                            <img src="${productImage}" alt="${product.productName}" style="width: 100%; height: auto;">
                        </a>
                        <p>${product.productName}</p>
                        <p>Price: $${formattedPrice}</p>
                        <a href="${editLink}"><button style="background-color: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer;">Edit</button></a>
                    </div>
                `);
            }
            res.write('</div>');
        }

        res.end();
    } catch (err) {
        console.error("Error retrieving data from SQL:", err);
        res.status(500).send(`<p>Error retrieving jerseys: ${err.message}</p>`);
    }
});

// Edit Product page
router.get('/editprod', async function (req, res) {
    if (!req.session.authenticatedUser) {
        req.session.current_url = req.originalUrl;
        return res.redirect('/login');
    }

    const productId = req.query.id;

    try {
        const pool = await sql.connect(req.dbConfig);
        const request = pool.request();
        const query = `
            SELECT 
                productId, 
                productName, 
                productPrice, 
                productDesc, 
                categoryId, 
                teamId 
            FROM dbo.product 
            WHERE productId = @productId
        `;
        request.input('productId', sql.Int, productId);
        const result = await request.query(query);
        const product = result.recordset[0];
        product.productImage = 0;

        console.warn(JSON.stringify(product));

        const editProductHtml = `
            <html>
            <head>
                <title>Edit Product</title>
                <style>
                    body { background-color: black; color: white; font-family: Arial, sans-serif; text-align: center; margin-top: 50px; }
                    form { display: inline-block; text-align: left; }
                    label { display: block; margin-top: 10px; }
                    input, select, textarea { width: 100%; padding: 8px; margin-top: 5px; }
                    button { margin-top: 20px; padding: 10px 20px; font-size: 16px; background-color: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer; }
                    button:hover { background-color: #0056b3; }
                </style>
            </head>
            <body>
                ${getHeader()}
                ${getAdminDashboardButton()}
                <h1>Edit Product</h1>
                <form action="/admin/editprod" method="post" enctype="multipart/form-data">
                    <input type="hidden" name="productId" value="${product.productId}">                     
                    <label for="productName">Product Name:</label>
                    <input type="text" id="productName" name="productName" value="${product.productName}" required>
                    
                    <label for="productPrice">Product Price:</label>
                    <input type="number" id="productPrice" name="productPrice" step="0.01" value="${product.productPrice}" required>
                    
                    <label for="productDesc">Product Description:</label>
                    <textarea id="productDesc" name="productDesc" required>${product.productDesc}</textarea>
                    
                    <label for="categoryId">Player Status:</label>
                    <select id="categoryId" name="categoryId" required>
                        <option value="1" ${product.categoryId === 1 ? 'selected' : ''}>Current</option>
                        <option value="2" ${product.categoryId === 2 ? 'selected' : ''}>Historic</option>
                    </select>
                    
                    <label for="teamId">Team:</label>
                    <select id="teamId" name="teamId" required>
                        <option value="1" ${product.teamId === 1 ? 'selected' : ''}>Warriors</option>
                        <option value="2" ${product.teamId === 2 ? 'selected' : ''}>Lakers</option>
                        <option value="3" ${product.teamId === 3 ? 'selected' : ''}>Bulls</option>
                        <option value="4" ${product.teamId === 4 ? 'selected' : ''}>Celtics</option>
                        <option value="5" ${product.teamId === 5 ? 'selected' : ''}>Nets</option>
                        <option value="6" ${product.teamId === 6 ? 'selected' : ''}>Bucks</option>
                        <option value="7" ${product.teamId === 7 ? 'selected' : ''}>Spurs</option>
                        <option value="8" ${product.teamId === 8 ? 'selected' : ''}>Mavericks</option>
                        <option value="9" ${product.teamId === 9 ? 'selected' : ''}>76ers</option>
                        <option value="10" ${product.teamId === 10 ? 'selected' : ''}>Nuggets</option>
                        <option value="11" ${product.teamId === 11 ? 'selected' : ''}>Suns</option>
                        <option value="12" ${product.teamId === 12 ? 'selected' : ''}>Heat</option>
                        <option value="13" ${product.teamId === 13 ? 'selected' : ''}>Hawks</option>
                        <option value="14" ${product.teamId === 14 ? 'selected' : ''}>Hornets</option>
                        <option value="15" ${product.teamId === 15 ? 'selected' : ''}>Pistons</option>
                        <option value="16" ${product.teamId === 16 ? 'selected' : ''}>Pacers</option>
                        <option value="17" ${product.teamId === 17 ? 'selected' : ''}>Raptors</option>
                        <option value="18" ${product.teamId === 18 ? 'selected' : ''}>Magic</option>
                        <option value="19" ${product.teamId === 19 ? 'selected' : ''}>Wizards</option>
                        <option value="20" ${product.teamId === 20 ? 'selected' : ''}>Cavaliers</option>
                        <option value="21" ${product.teamId === 21 ? 'selected' : ''}>Timberwolves</option>
                        <option value="22" ${product.teamId === 22 ? 'selected' : ''}>Pelicans</option>
                        <option value="23" ${product.teamId === 23 ? 'selected' : ''}>Kings</option>
                        <option value="24" ${product.teamId === 24 ? 'selected' : ''}>Jazz</option>
                        <option value="25" ${product.teamId === 25 ? 'selected' : ''}>Thunder</option>
                        <option value="26" ${product.teamId === 26 ? 'selected' : ''}>Rockets</option>
                        <option value="27" ${product.teamId === 27 ? 'selected' : ''}>Knicks</option>
                        <option value="28" ${product.teamId === 28 ? 'selected' : ''}>Clippers</option>
                        <option value="29" ${product.teamId === 29 ? 'selected' : ''}>Grizzlies</option>
                    </select>
                    
                    <label for="productImage">Product Image (.jpg):</label>
                    <input type="file" id="productImage" name="productImage" value="${product.productImage}" accept=".jpg">
                    
                    <button type="submit">Update Jersey</button>
                </form>
                <form action="/admin/deleteprod" method="post" style="margin-top: 20px;">
                    <input type="hidden" name="productId" value="${product.productId}">
                    <button type="submit" style="background-color: red; color: white; border: none; border-radius: 5px; cursor: pointer;">Delete Jersey</button>
                </form>
            </body>
            </html>
        `;
        res.send(editProductHtml);
    } catch (err) {
        console.error("Error retrieving product data:", err);
        res.status(500).send(`<p>Error retrieving product data: ${err.message}</p>`);
    }
});

router.post('/editprod', async function (req, res) {
    if (!req.session.authenticatedUser) {
        req.session.current_url = req.originalUrl;
        return res.redirect('/login');
    }

    const form = new formidable.IncomingForm({ allowEmptyFiles: true, minFileSize : 0 });
    form.parse(req, async (err, fields, files) => {
        if (err) {
            console.error("Error parsing form:", err);
            return res.status(500).send("Error parsing form");
        }

        console.log("Files:", files); // Debugging line to view uploaded file details

        try {
            const pool = await sql.connect(req.dbConfig);
            const request = pool.request();

            const { productId, productName, productPrice, productDesc, categoryId, teamId } = fields;
            console.log("Fields:", fields);

            if (files.productImage[0].originalFilename.length > 0) {
                // can't do this because it creates a new product not updating an existing one
                await saveJersey(req.dbConfig, files, productName, productPrice, productDesc, categoryId, teamId);
                await deleteJersey(req.dbConfig, productId);
                // console.error("Error updating jersey: can't update image: " + files.productImage[0].originalFilename);

            } else {
                const updateQuery = `
                    UPDATE product 
                    SET productName = @productName, 
                        productPrice = @productPrice, 
                        productDesc = @productDesc, 
                        categoryId = @categoryId,  
                        teamId = @teamId 
                    WHERE productId = @productId
                `;

                await request
                    .input('productId', sql.Int, productId)
                    .input('productName', sql.VarChar, productName)
                    .input('productPrice', sql.Decimal(10, 2), productPrice)
                    .input('productDesc', sql.VarChar, productDesc)
                    .input('categoryId', sql.Int, categoryId)
                    .input('teamId', sql.Int, teamId)
                    .query(updateQuery);
            }

            // Handle file upload if a new image is provided
            // if (files.productImage && files.productImage.size > 0) {
            //     const dir = path.join(__dirname, '..', 'public', 'images', 'jerseys');
            //     if (!fs.existsSync(dir)) {
            //         fs.mkdirSync(dir, { recursive: true });
            //     }

            //     const oldPath = files.productImage.filepath;
            //     const newPath = path.join(dir, `${productId}.jpg`);
            //     fs.copyFileSync(oldPath, newPath);
            // }

            res.redirect('/admin/edit-jersey');
        } catch (err) {
            console.error("Error updating jersey:", err);
            res.status(500).send("Error updating jersey");
        }
    });
});

async function deleteJersey(dbConfig, productId) {
    const pool = await sql.connect(dbConfig);
    const request = pool.request();

    const deleteQuery = `
        DELETE FROM product 
        WHERE productId = @productId
    `;

    await request.input('productId', sql.Int, productId).query(deleteQuery);

    // Delete the product image
    const imagePath = path.join(__dirname, '..', 'public', 'images', 'jerseys', `${productId}.jpg`);
    if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
    }
}

router.post('/deleteprod', async function (req, res) {
    if (!req.session.authenticatedUser) {
        req.session.current_url = req.originalUrl;
        return res.redirect('/login');
    }

    const productId = req.body.productId;

    try {
        await deleteJersey(req.dbConfig, productId);
        // const pool = await sql.connect(req.dbConfig);
        // const request = pool.request();

        // const deleteQuery = `
        //     DELETE FROM product 
        //     WHERE productId = @productId
        // `;

        // await request.input('productId', sql.Int, productId).query(deleteQuery);

        // // Delete the product image
        // const imagePath = path.join(__dirname, '..', 'public', 'images', 'jerseys', `${productId}.jpg`);
        // if (fs.existsSync(imagePath)) {
        //     fs.unlinkSync(imagePath);
        // }

        res.redirect('/admin/edit-jersey');
    } catch (err) {
        console.error("Error deleting jersey:", err);
        res.status(500).send("Error deleting jersey");
    }
});

// Restore Database page
router.get('/restore-database', async function (req, res) {
    if (!req.session.authenticatedUser) {
        req.session.current_url = req.originalUrl;
        return res.redirect('/login');
    }

    (async function() {
        try {
            let pool = await sql.connect(req.dbConfig);

            res.setHeader('Content-Type', 'text/html');
            res.write('<title>Data Loader</title>');
            res.write('<style>body { background-color: black; color: white; font-family: Arial, sans-serif; }</style>');
            res.write('<h1>Connecting to database.</h1><p>');

            let data = fs.readFileSync("./ddl/SQLServer_orderJerseyNEm.ddl", { encoding: 'utf8' });
            let commands = data.split(";");
            for (let i = 0; i < commands.length; i++) {
                let command = commands[i];
                res.write(command);                
                try {
                    let result = await pool.request().query(command);
                    res.write('<p>' + JSON.stringify(result) + '</p>');
                }
                catch (err) {
                    // Ignore any errors                    
                }            
            }

            res.write('"<h2>Database loading complete!</h2>');
            res.end();
        } catch(err) {
            console.dir(err);
            res.write(err.toString());
            res.write("<p>Database connection error!</p>");
        }
        res.end();
    })();
});

module.exports = router;