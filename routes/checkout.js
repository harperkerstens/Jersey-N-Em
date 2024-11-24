const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');

router.get('/', async function (req, res, next) {
    if (!req.session.authenticatedUser) {
        return res.redirect('/login');
    }

    const userId = req.session.authenticatedUser.userid;
    const productList = req.session.productList || [];

    res.setHeader('Content-Type', 'text/html');
    res.write("<title>Grocery CheckOut Line</title>");
    res.write("<h1>Complete your transaction:</h1>");

    if (productList.length === 0) {
        res.write('<p>Your shopping cart is empty!</p>');
        res.write('<a href="/listprod">Continue Shopping</a>');
    } else {
        res.write('<h2>Your Shopping Cart</h2>');
        res.write('<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 20px;">');
        
        productList.forEach(product => {
            const imageExtensions = ['jpg', 'jpeg', 'png', 'gif'];
            let productImage = '/images/default.jpg'; 
            let baseDir = path.resolve(__dirname, '..');

            for (const ext of imageExtensions) {
                const imagePath = path.join(baseDir, 'public', 'images', `${product.id}.${ext}`);
                if (fs.existsSync(imagePath)) {
                    productImage = `/images/${product.id}.${ext}`;
                    break;
                }
            }

            res.write(`
                <div style="border: 1px solid #ccc; padding: 10px; text-align: center;">
                    <img src="${productImage}" alt="${product.name}" style="width: 100%; height: auto;">
                    <p>${product.name}</p>
                    <p>Price: $${product.price.toFixed(2)}</p>
                    <p>Quantity: ${product.quantity}</p>
                    <p>Subtotal: $${(product.price * product.quantity).toFixed(2)}</p>
                </div>
            `);
        });

        res.write('</div>');
        res.write('<form method="get" action="order">');
        res.write('<input type="submit" value="Checkout">');
        res.write('</form>');
    }

    res.end();
});

module.exports = router;
