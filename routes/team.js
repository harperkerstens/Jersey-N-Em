const express = require('express');
const router = express.Router();
const sql = require('mssql');
const path = require('path');
const fs = require('fs');
const getHeader = require('./header');

router.get('/', async function (req, res) {
    const teamName = req.query.name;
    const teamId = req.query.teamId; // Assuming teamId is passed as a query parameter

    if (!teamName || !teamId) {
        res.status(400).send("Team name and team ID are required");
        return;
    }

    res.setHeader('Content-Type', 'text/html');
    res.write(`<title>${teamName} Products</title>`);
    res.write("<style>body { background-color: black; color: white; font-family: Arial, sans-serif;}</style>");
    res.write(getHeader());
    res.write(`<h1>Products for ${teamName}</h1>`);

    // Buttons to switch between sections
    res.write(`
        <div style="text-align: center; margin-bottom: 20px;">
            <button onclick="showSection('current')" style="padding: 15px 30px; font-size: 18px; background-color: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer;">Current</button>
            <button onclick="showSection('historic')" style="padding: 15px 30px; font-size: 18px; background-color: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer;">Historic</button>
            <button onclick="showSection('all')" style="padding: 15px 30px; font-size: 18px; background-color: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer;">All</button>
        </div>
        <script>
            function showSection(section) {
                document.getElementById('current').style.display = section === 'current' || section === 'all' ? 'block' : 'none';
                document.getElementById('historic').style.display = section === 'historic' || section === 'all' ? 'block' : 'none';
            }
            // Show all sections by default
            showSection('all');
        </script>
    `);

    try {
        // Connect to the database
        const pool = await sql.connect(dbConfig);

        // Queries to get current and historic products for the specific team
        const currentQuery = `
            SELECT 
                productId, 
                productName, 
                productPrice,
                productDesc
            FROM dbo.product
            WHERE teamId = @teamId AND categoryId = 1
        `;
        const historicQuery = `
            SELECT 
                productId, 
                productName, 
                productPrice,
                productDesc
            FROM dbo.product
            WHERE teamId = @teamId AND categoryId = 2
        `;
        const request = pool.request();
        request.input('teamId', sql.Int, teamId);

        const currentResult = await request.query(currentQuery);
        const historicResult = await request.query(historicQuery);

        // Function to render products
        const renderProducts = (products) => {
            let html = '<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 20px; color: white;">';
            for (const product of products) {
                const formattedPrice = product.productPrice.toFixed(2);
                const productLink = `/product?id=${product.productId}`;
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

                html += `
                    <div style="border: 1px solid #ccc; padding: 10px; text-align: center; background-color: white; color: black;">
                        <a href="${productLink}">
                            <img src="${productImage}" alt="${product.productName}" style="width: 100%; height: auto;">
                        </a>
                        <p><a href="${productLink}" style="color: black;">${product.productName}</a></p>
                        <p>Price: $${formattedPrice}</p>
                        <form method="POST" action="/addcart">
                            <input type="hidden" name="id" value="${product.productId}">
                            <input type="hidden" name="name" value="${product.productName}">
                            <input type="hidden" name="price" value="${formattedPrice}">
                            <button type="submit" style="background-color: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer;">Add to Cart</button>
                        </form>
                    </div>
                `;
            }
            html += '</div>';
            return html;
        };

        // Render current products
        res.write(`<div id="current" style="display: block;"><h2>Current Players</h2>`);
        if (currentResult.recordset.length === 0) {
            res.write(`<p>No current products found for ${teamName}.</p>`);
        } else {
            res.write(renderProducts(currentResult.recordset));
        }
        res.write('</div>');

        // Render historic products
        res.write(`<div id="historic" style="display: block;"><h2>Historic Players</h2>`);
        if (historicResult.recordset.length === 0) {
            res.write(`<p>No historic products found for ${teamName}.</p>`);
        } else {
            res.write(renderProducts(historicResult.recordset));
        }
        res.write('</div>');

        res.end();
    } catch (err) {
        console.error("Error retrieving data from SQL:", err);
        if (!res.headersSent) {
            res.status(500).send(`<p>Error retrieving products: ${err.message}</p>`);
        }
    }
});

module.exports = router;