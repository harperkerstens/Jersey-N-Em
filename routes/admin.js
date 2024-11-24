const express = require('express');
const router = express.Router();
const sql = require('mssql');
const getHeader = require('./header');

router.get('/', async function (req, res) {
    if (!req.session.authenticatedUser) {
        return res.redirect('/login');
    }

    try {
        const pool = await sql.connect(req.dbConfig);
        const request = pool.request();

        const query = `
            SELECT 
                CONVERT(VARCHAR, orderDate, 23) AS orderDate, 
                SUM(totalAmount) AS totalOrderAmount 
            FROM dbo.ordersummary 
            GROUP BY CONVERT(VARCHAR, orderDate, 23)
            ORDER BY orderDate
        `;

        const result = await request.query(query);

        const salesReportHtml = `
            <html>
            <head>
                <title>Administrator Sales Report by Day</title>
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
                    <tr><th>Order Date</th><th>Total Order Amount</th></tr>
                    ${result.recordset.map(row => `
                        <tr>
                            <td>${row.orderDate}</td>
                            <td>${row.totalOrderAmount}</td>
                        </tr>
                    `).join('')}
                </table>
            </body>
            </html>
        `;

        res.send(salesReportHtml);
    } catch (err) {
        console.error("Error retrieving sales report:", err);
        res.status(500).send(`<p>Error retrieving sales report: ${err.message}</p>`);
    }
});

module.exports = router;