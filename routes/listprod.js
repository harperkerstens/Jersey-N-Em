const express = require('express');
const router = express.Router();
const sql = require('mssql');
const path = require('path');
const fs = require('fs');
const getHeader = require('./header'); 

// Serve static files from the 'images' folder
router.use('/images', express.static(path.join(__dirname, '..', 'images')));

router.get('/', async function (req, res) {
    res.setHeader('Content-Type', 'text/html');
    res.write("<title>YOUR NAME Grocery</title>");
    res.write(getHeader()); 
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
                    productPrice,
                    productImage
                FROM dbo.product
                WHERE productName LIKE '%' + @productName + '%'
            `;
            request.input('productName', sql.NVarChar, name); // Prevent SQL injection
        } else {
            query = `
                SELECT 
                    productId, 
                    productName, 
                    productPrice,
                    productImage
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
            // Display the products in a grid
            res.write('<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 20px;">');
            for (const product of result.recordset) {
                const formattedPrice = product.productPrice.toFixed(2);
                const productLink = `/product?id=${product.productId}`;
                const addCartLink = `/addcart?id=${product.productId}&name=${encodeURIComponent(product.productName)}&price=${formattedPrice}`;
                
                // Check for multiple image file types
                const imageExtensions = ['jpg', 'jpeg', 'png', 'gif'];
                let productImage = '/images/default.jpg'; 
                let baseDir = path.resolve(__dirname, '..');

                for (const ext of imageExtensions) {
                    const imagePath = path.join(baseDir, 'public', 'images', `${product.productId}.${ext}`);
                    if (fs.existsSync(imagePath)) {
                        productImage = `/images/${product.productId}.${ext}`;
                        break;
                    }
                }

                // Log the image path for debugging
                // console.log(`Product Image: ${productImage}`);
                
                res.write(`
                    <div style="border: 1px solid #ccc; padding: 10px; text-align: center;">
                        <a href="${productLink}">
                            <img src="${productImage}" alt="${product.productName}" style="width: 100%; height: auto;">
                        </a>
                        <p><a href="${productLink}">${product.productName}</a></p>
                        <p>Price: $${formattedPrice}</p>
                        <form method="POST" action="/addcart">
                            <input type="hidden" name="id" value="${product.productId}">
                            <input type="hidden" name="name" value="${product.productName}">
                            <input type="hidden" name="price" value="${formattedPrice}">
                            <button type="submit">Add to Cart</button>
                        </form>
                    </div>
                `);
            }
            res.write('</div>');
        }

        res.end();
    } catch (err) {
        console.error("Error retrieving data from SQL:", err);
        res.status(500).send(`<p>Error retrieving products: ${err.message}</p>`);
    }
});

module.exports = router;
