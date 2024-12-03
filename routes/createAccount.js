
const express = require('express');
const router = express.Router();
const sql = require('mssql');

router.get('/', function (req, res) {
    res.render('createAccount', { title: "Create Account" });
});

router.post('/', async function (req, res) {
    const { firstName, lastName, email, phonenum, address, city, state, postalCode, country, userid, password } = req.body;

    if (!firstName || !lastName || !email || !phonenum || !address || !city || !state || !postalCode || !country || !userid || !password) {
        return res.render('createAccount', { title: "Create Account", error: "All fields are required" });
    }

    try {
        const pool = await sql.connect(dbConfig);
        const request = pool.request();
        request.input('email', sql.NVarChar, email);
        request.input('phonenum', sql.NVarChar, phonenum);
        request.input('userid', sql.NVarChar, userid);

        const checkQuery = `
            SELECT * FROM dbo.customer 
            WHERE email = @email OR phonenum = @phonenum OR userid = @userid
        `;
        const checkResult = await request.query(checkQuery);

        if (checkResult.recordset.length > 0) {
            return res.render('createAccount', { title: "Create Account", error: "Email, phone number, or user ID already exists" });
        }

        const insertQuery = `
            INSERT INTO dbo.customer (firstName, lastName, email, phonenum, address, city, state, postalCode, country, userid, password)
            VALUES (@firstName, @lastName, @email, @phonenum, @address, @city, @state, @postalCode, @country, @userid, @password)
        `;
        request.input('firstName', sql.NVarChar, firstName);
        request.input('lastName', sql.NVarChar, lastName);
        request.input('address', sql.NVarChar, address);
        request.input('city', sql.NVarChar, city);
        request.input('state', sql.NVarChar, state);
        request.input('postalCode', sql.NVarChar, postalCode);
        request.input('country', sql.NVarChar, country);
        request.input('password', sql.NVarChar, password);

        await request.query(insertQuery);

        res.redirect('/login');
    } catch (err) {
        console.error("Error during account creation:", err);
        res.status(500).send(`<p>Error during account creation: ${err.message}</p>`);
    }
});

module.exports = router;