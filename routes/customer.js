const express = require('express');
const router = express.Router();
const sql = require('mssql');
const getHeader = require('./header');

router.get('/', async function (req, res) {
    if (!req.session.authenticatedUser) {
        return res.redirect('/login');
    }

    const userId = req.session.authenticatedUser.userid;

    try {
        const pool = await sql.connect(req.dbConfig);
        const request = pool.request();
        request.input('userId', sql.NVarChar, userId);

        const query = `
            SELECT * FROM dbo.customer 
            WHERE userid = @userId
        `;

        const result = await request.query(query);

        if (result.recordset.length === 1) {
            const customer = result.recordset[0];
            const customerDataHtml = `
                <html>
                <head>
                    <title>Customer Profile</title>
                    <style>
                        table { width: 50%; margin: auto; border-collapse: collapse; margin-top: 20px; }
                        th, td { border: 1px solid #ddd; padding: 8px; }
                        th { background-color: #f2f2f2; }
                        nav { text-align: center; margin-bottom: 20px; }
                        nav a { margin: 0 15px; text-decoration: none; color: #000; }
                    </style>
                </head>
                <body>
                    ${getHeader()}
                    <table>
                        <tr><th>Field</th><th>Data</th></tr>
                        ${Object.keys(customer).map(key => `
                            <tr>
                                <td>${key}</td>
                                <td>${customer[key]}</td>
                            </tr>
                        `).join('')}
                    </table>
                </body>
                </html>
            `;
            res.send(customerDataHtml);
        } else {
            res.status(404).send(`<p>Customer not found.</p>`);
        }
    } catch (err) {
        console.error("Error retrieving customer information:", err);
        res.status(500).send(`<p>Error retrieving customer information: ${err.message}</p>`);
    }
});

module.exports = router;
