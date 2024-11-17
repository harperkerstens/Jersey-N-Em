const express = require('express');
const router = express.Router();
const sql = require('mssql');


router.get('/', async function (req, res) {
    res.setHeader('Content-Type', 'text/html');
    res.write("<title>YOUR NAME Grocery</title>");
    res.write("<h1>Product Search</h1>");

    // Display the search form
    res.write(`
        <form method="GET" action="/listprod">
            <label for="productName">Search for a product:</label>
            <input type="text" id="productName" name="productName">
            <button type="submit">Search</button>
        </form>
        <hr>
    `);

    // Get the product name from query parameters
    const name = req.query.productName;

    try {
        // Connect to the database
        const pool = await sql.connect(dbConfig);

        // Query to search for products by name (if provided) or list all products
        let query;
        const request = pool.request();

        if (name) {
            query = `
                SELECT 
                    productId, 
                    productName, 
                    productPrice 
                FROM dbo.product
                WHERE productName LIKE '%' + @productName + '%'
            `;
            request.input('productName', sql.NVarChar, name); // Prevent SQL injection
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

        // Display the search results
        if (name) {
            res.write(`<h2>Search Results for "${name}":</h2>`);
        } else {
            res.write("<h2>All Products:</h2>");
        }

        if (result.recordset.length === 0) {
            res.write(`<p>No products found${name ? ` for "${name}"` : ""}.</p>`);
        } else {
            res.write("<ul>");
            for (const product of result.recordset) {
                const formattedPrice = product.productPrice.toFixed(2);
                const addCartLink = `addcart?id=${product.productId}&name=${encodeURIComponent(product.productName)}&price=${formattedPrice}`;
                res.write(`<li>${product.productName} - $${formattedPrice} <a href="${addCartLink}">Add to Cart</a></li>`);
            }
            res.write("</ul>");
        }

        res.end();
    } catch (err) {
        console.error("Database error:", err);
        if (!res.headersSent) {
            res.status(500).send("<p>An error occurred while retrieving the products.</p>");
        }
    }
});

module.exports = router;
