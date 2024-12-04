
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: 'localhost',
    user: 'your-username',
    password: 'your-password',
    database: 'orders'
});

module.exports = {
    query: async (sql, params) => {
        const [results] = await pool.execute(sql, params);
        return results;
    }
};