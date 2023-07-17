const mysql = require('mysql2');

const dbPool = mysql.createPool({
    connectionLimit    : 100,
    host               : process.env.HOST,
    user               : process.env.USER_PS,
    password           : process.env.PASSWORD_PS,
    database           : process.env.DATABASE,
    multipleStatements : false,
    ssl                : {"rejectUnauthorized":true}
});

// const dbPool = mysql.createPool(process.env.DATABASE_URL);

module.exports = dbPool;