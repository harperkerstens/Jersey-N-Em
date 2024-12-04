const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const getHeader = require('./header');

router.use(express.urlencoded({ extended: true })); // To handle URL-encoded form data

router.get('/', function(req, res) {
    res.setHeader('Content-Type', 'text/html');
    let cart = req.session.productList || [];
    req.session.current_url = req.originalUrl;

    res.write(getHeader()); // Include the header

    res.write(`
        <style>
            .cart-container {
                display: flex;
                flex-direction: column;
                align-items: center;
                text-align: center;
            }
            .cart-item {
                display: flex;
                align-items: center;
                border: 1px solid #ccc;
                padding: 10px;
                margin: 10px;
                width: 80%;
            }
            .cart-item img {
                max-width: 100px;
                margin-right: 20px;
            }
            .cart-buttons {
                margin-top: 20px;
            }
            .cart-buttons a, .cart-buttons button {
                margin: 0 10px;
                padding: 10px 20px;
                background-color: #007bff;
                color: white;
                text-decoration: none;
                border: none;
                border-radius: 5px;
                cursor: pointer;
            }
        </style>
    `);

    res.write('<div class="cart-container">');

    if (cart.length === 0) {
        res.write('<p>Your shopping cart is empty!</p>');
        res.write('<a href="/listprod" class="cart-buttons">Continue Shopping</a>');
    } else {
        res.write('<h1>Your Shopping Cart</h1>');
        cart.forEach(product => {
            const imageExtensions = ['jpg', 'jpeg', 'png', 'gif'];
            let productImage = '/images/jerseys/default.jpg'; 
            let baseDir = path.resolve(__dirname, '..', 'public', 'images', 'jerseys');

            for (const ext of imageExtensions) {
                const imagePath = path.join(baseDir, `${product.id}.${ext}`);
                if (fs.existsSync(imagePath)) {
                    productImage = `/images/jerseys/${product.id}.${ext}`;
                    break;
                }
            }

            res.write(`
                <div class="cart-item">
                    <img src="${productImage}" alt="${product.name}">
                    <div>
                        <p>${product.name}</p>
                        <p>Price: $${product.price ? product.price.toFixed(2) : 'N/A'}</p>
                        <p>Quantity: ${product.quantity}</p>
                        <p>Subtotal: $${product.price ? (product.price * product.quantity).toFixed(2) : 'N/A'}</p>
                        <form method="POST" action="/showcart" style="display: inline;">
                            <input type="hidden" name="id" value="${product.id}">
                            <input type="number" name="quantity" value="${product.quantity}" min="1" style="width: 50px;">
                            <button type="submit" name="action" value="update">Update</button>
                        </form>
                        <form method="POST" action="/showcart" style="display: inline;">
                            <input type="hidden" name="id" value="${product.id}">
                            <button type="submit" name="action" value="remove">Remove</button>
                        </form>
                    </div>
                </div>
            `);
        });

        res.write(`
            <div class="cart-buttons">
                <a href="/checkout">Proceed to Checkout</a>
                <a href="/listprod">Continue Shopping</a>
            </div>
        `);
    }

    res.write('</div>');
    res.end();
});

router.post('/', function(req, res) {
    let cart = req.session.productList || [];
    const productId = req.body.id;
    const action = req.body.action;

    if (action === 'update') {
        const newQuantity = parseInt(req.body.quantity);
        if (newQuantity > 0) {
            let product = cart.find(p => p.id === productId);
            if (product) {
                product.quantity = newQuantity;
            }
        }
    } else if (action === 'remove') {
        cart = cart.filter(p => p.id !== productId);
    }

    req.session.productList = cart;
    res.redirect('/showcart');
});

module.exports = router;