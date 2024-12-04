const express = require('express');
const router = express.Router();
const sql = require('mssql');
const path = require('path');
const fs = require('fs');
const getHeader = require('./header');

router.get('/', async function (req, res) {
    res.setHeader('Content-Type', 'text/html');
    res.write("<title>YOUR NAME Grocery - Product Details</title>");
    res.write("<style>body { background-color: black; color: white; font-family: Arial, sans-serif;}</style>");
    res.write(getHeader());

    const productId = req.query.id;

    try {
        const pool = await sql.connect(dbConfig);
        const request = pool.request();
        request.input('productId', sql.Int, productId);

        const query = `
            SELECT 
                productId, 
                productName, 
                productDesc AS productDescription, 
                productPrice
            FROM dbo.product 
            WHERE productId = @productId
        `;

        const result = await request.query(query);

        if (result.recordset.length === 0) {
            res.write(`<p>Product not found.</p>`);
        } else {
            const product = result.recordset[0];
            const formattedPrice = product.productPrice.toFixed(2);
            const addCartLink = `/addcart?id=${product.productId}&name=${encodeURIComponent(product.productName)}&price=${formattedPrice}`;

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
                <div style="text-align: center; background-color: white; color: black; padding: 20px; border-radius: 10px; margin: 20px;">
                    <h1>${product.productName}</h1>
                    <img src="${productImage}" alt="${product.productName}" style="width: 35%; height: auto;">
                    <p>${product.productDescription}</p>
                    <p>Price: $${formattedPrice}</p>
                    <form method="POST" action="/addcart">
                        <input type="hidden" name="id" value="${product.productId}">
                        <input type="hidden" name="name" value="${product.productName}">
                        <input type="hidden" name="price" value="${formattedPrice}">
                        <button type="submit" style="padding: 15px 30px; font-size: 18px;">Add to Cart</button>
                    </form>
                </div>
            `);
        }

        res.end();
    } catch (err) {
        console.error("Error retrieving product details from SQL:", err);
        res.status(500).send(`<p>Error retrieving product details: ${err.message}</p>`);
    }
});

module.exports = router;
