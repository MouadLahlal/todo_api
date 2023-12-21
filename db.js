// const mysql = require('mysql2');

// const dbPool = mysql.createPool({
//     connectionLimit    : 100,
//     host               : process.env.HOST,
//     user               : process.env.USER_PS,
//     password           : process.env.PASSWORD_PS,
//     database           : process.env.DATABASE,
//     multipleStatements : false,
//     ssl                : {"rejectUnauthorized":true},
//     charset            : 'utf8mb4'
// });

// module.exports = dbPool;

// supabase password project
// ueQijHMwtm8SMtdz

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

module.exports = {supabase};