const express = require('express');
const router = express.Router();
const auth = require('../auth');
const sql = require('mssql');

router.post('/', function(req, res) {
    // Have to preserve async context since we make an async call
    // to the database in the validateLogin function.
    (async () => {
        let authenticatedUser = await validateLogin(req);
        if (authenticatedUser) {
            res.redirect("/");
        } else {
            req.session.current_url = req.originalUrl;
            res.redirect("/login");
        }
     })();
});

async function validateLogin(req) {
    if (!req.body || !req.body.username || !req.body.password) {
        return false;
    }

    let username = req.body.username;
    let password = req.body.password;
    let authenticatedUser =  await (async function() {
        try {
            let pool = await sql.connect(dbConfig);

            const query = `
                SELECT username 
                FROM dbo.customers 
                WHERE username = @username AND password = @password
            `;
            const request = pool.request();
            request.input('username', sql.NVarChar, username);
            request.input('password', sql.NVarChar, password);

            const result = await request.query(query);

            if (result.recordset.length > 0) {
                return username;
            }

            return false;
        } catch(err) {
            console.dir(err);
            return false;
        }
    })();

    return authenticatedUser;
}

module.exports = router;
