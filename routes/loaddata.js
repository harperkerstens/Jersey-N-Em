const express = require('express');
const router = express.Router();
const sql = require('mssql');
const fs = require('fs');

router.get('/', function(req, res, next) {
    (async function() {
        try {
            let pool = await sql.connect(dbConfig);

            res.setHeader('Content-Type', 'text/html');
            res.write('<title>Data Loader</title>');
            res.write('<h1>Connecting to database.</h1><p>');

            let data = fs.readFileSync("./ddl/SQLServer_orderJerseyNEm.ddl", { encoding: 'utf8' });
            let commands = data.split(";");
            for (let i = 0; i < commands.length; i++) {
                let command = commands[i];
                res.write(command);                
                try {
                    let result = await pool.request().query(command);
                    res.write('<p>' + JSON.stringify(result) + '</p>');
                }
                catch (err) {
                    // Ignore any errors                    
                }            
            }

            res.write('"<h2>Database loading complete!</h2>');
            res.end();
        } catch(err) {
            console.dir(err);
            res.write(err.toString());
            res.write("<p>Database connection error!</p>");
        }
        res.end();
    })();
});

module.exports = router;
