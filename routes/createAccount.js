const express = require('express');
const router = express.Router();
const sql = require('mssql');

router.get('/', function (req, res) {
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Create Account</title>
            <style>
                body { background-color: black; color: white; font-family: Arial, sans-serif; }
                .form-container { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; }
                .form-container form { display: flex; flex-direction: column; width: 300px; }
                .form-container input { padding: 10px; margin-bottom: 10px; font-size: 16px; }
                .form-container button { padding: 10px; font-size: 16px; background-color: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer; }
            </style>
        </head>
        <body>
            <div class="form-container">
                <h1>Create Account</h1>
                <form method="post">
                    <input type="text" name="firstName" placeholder="First Name">
                    <input type="text" name="lastName" placeholder="Last Name">
                    <input type="email" name="email" placeholder="Email">
                    <input type="text" name="phonenum" placeholder="Phone Number">
                    <input type="text" name="address" placeholder="Address">
                    <input type="text" name="city" placeholder="City">
                    <input type="text" name="state" placeholder="State">
                    <input type="text" name="postalCode" placeholder="Postal Code">
                    <input type="text" name="country" placeholder="Country">
                    <input type="text" name="userid" placeholder="User ID">
                    <input type="password" name="password" placeholder="Password">
                    <button type="submit">Create Account</button>
                </form>
            </div>
        </body>
        </html>
    `);
});

router.post('/', async function (req, res) {
    const { firstName, lastName, email, phonenum, address, city, state, postalCode, country, userid, password } = req.body;

    if (!firstName || !lastName || !email || !phonenum || !address || !city || !state || !postalCode || !country || !userid || !password) {
        return res.send(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Create Account</title>
                <style>
                    body { background-color: black; color: white; font-family: Arial, sans-serif; }
                    .form-container { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; }
                    .form-container form { display: flex; flex-direction: column; width: 300px; }
                    .form-container input { padding: 10px; margin-bottom: 10px; font-size: 16px; }
                    .form-container button { padding: 10px; font-size: 16px; background-color: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer; }
                </style>
            </head>
            <body>
                <div class="form-container">
                    <h1>Create Account</h1>
                    <p style="color: red;">All fields are required</p>
                    <form method="post">
                        <input type="text" name="firstName" placeholder="First Name">
                        <input type="text" name="lastName" placeholder="Last Name">
                        <input type="email" name="email" placeholder="Email">
                        <input type="text" name="phonenum" placeholder="Phone Number">
                        <input type="text" name="address" placeholder="Address">
                        <input type="text" name="city" placeholder="City">
                        <input type="text" name="state" placeholder="State">
                        <input type="text" name="postalCode" placeholder="Postal Code">
                        <input type="text" name="country" placeholder="Country">
                        <input type="text" name="userid" placeholder="User ID">
                        <input type="password" name="password" placeholder="Password">
                        <button type="submit">Create Account</button>
                    </form>
                </div>
            </body>
            </html>
        `);
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