const express = require('express');
const router = express.Router();

// Rendering the main page
router.get('/', function (req, res) {
    let username = req.session.authenticatedUser ? req.session.authenticatedUser : false;

    res.render('index', {
        title: "Ray's Grocery",
        username: username,
        links: [
            { href: '/login', text: 'Login' },
            { href: '/listprod', text: 'Begin Shopping' },
            { href: '/listorder', text: 'List All Orders' },
            { href: '/customer', text: 'Customer Info' },
            { href: '/admin', text: 'Administrators' },
            { href: '/showcart', text: 'Cart' },
            { href: '/logout', text: 'Log out' }
        ]
    });
});

module.exports = router;
