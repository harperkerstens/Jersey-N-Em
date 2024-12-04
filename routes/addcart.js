const express = require('express');
const router = express.Router();

router.get('/', function(req, res, next) {
    res.setHeader('Content-Type', 'text/html');
    // If the product list isn't set in the session,
    // create a new list.
    let productList = req.session.productList || [];

    // Add new product selected
    // Get product information
    let id = req.query.id;
    let name = req.query.name;
    let price = parseFloat(req.query.price);

    if (!id || !name || isNaN(price)) {
        return res.redirect("/listprod");
    }

    // Update quantity if add same item to order again
    let product = productList.find(p => p.id === id);
    if (product) {
        product.quantity += 1;
    } else {
        productList.push({
            id: id,
            name: name,
            price: parseFloat(price),
            quantity: 1
        });
    }

    req.session.productList = productList;
    res.redirect("/showcart");
});

router.post('/', function (req, res) {
    const productId = req.body.id;
    const productName = req.body.name;
    const productPrice = parseFloat(req.body.price);

    if (!productId || !productName || isNaN(productPrice)) {
        return res.redirect("/listprod");
    }

    // Add the product to the cart (this is just an example, you should implement your own logic)
    let productList = req.session.productList || [];

    let product = productList.find(p => p.id === productId);
    if (product) {
        product.quantity += 1;
    } else {
        productList.push({
            id: productId,
            name: productName,
            price: productPrice,
            quantity: 1
        });
    }

    req.session.productList = productList;
    res.redirect('/showcart');
});

module.exports = router;
