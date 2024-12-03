const express = require('express');
const router = express.Router();
const sql = require('mssql');

router.get('/', function (req, res) {
    res.render('login', { title: "Login" });
});

router.post('/', async function (req, res) {
    const { userid, password } = req.body;

    try {
        const pool = await sql.connect(dbConfig);
        const request = pool.request();
        request.input('userid', sql.NVarChar, userid);
        request.input('password', sql.NVarChar, password);

        const query = `
            SELECT * FROM dbo.customer 
            WHERE userid = @userid AND password = @password
        `;

        const result = await request.query(query);

        console.log('Query:', query);
        console.log('Result:', result.recordset);

        if (result.recordset.length === 1) {
            req.session.authenticatedUser = result.recordset[0];            
            let current_url = req.session.current_url;
            if (current_url) {
                req.session.current_url = null; // Clear the stored URL after redirecting
                res.redirect(current_url);
            } else {
                res.redirect('/');
            }
        } else {
            res.render('login', { title: "Login", error: "Invalid username or password" });
        }
    } catch (err) {
        console.error("Error during login:", err);
        res.status(500).send(`<p>Error during login: ${err.message}</p>`);
    }
});

module.exports = router;
