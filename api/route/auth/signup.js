const express = require('express');
const mysql = require('mysql');
const db = require('../../db');
const bcrypt = require('bcrypt');

const router = express.Router();

router.use(express.json());

const emailExists = (email) => {
    return new Promise((resolve, reject) => {
        db.getConnection(async (err, connection) => {
            await connection.query("SELECT email FROM account WHERE email = ?", [email], (error, results, fields) => {
                connection.release();
                if (error) {
                    console.log(error);
                    reject("error with the query");
                } else if (results.length > 0) {
                    resolve(true);
                } else {
                    resolve(false);
                }
            });
        });
    })
}

const usernameExists = (username) => {
    return new Promise((resolve, reject) => {
        db.getConnection(async (err, connection) => {
            await connection.query("SELECT username FROM account WHERE username = ?", [username], (error, results, fields) => {
                connection.release();
                if (error) {
                    console.log(error);
                    reject("error with the query");
                } else if (results.length > 0) {
                    resolve(true);
                } else {
                    resolve(false);
                }
            });
        });
    })
}

const generateAccountId = (username, password) => {
    return new Promise((resolve, reject) => {
        let data = `${username}.${password}`;
        const hash = bcrypt.hashSync(data, bcrypt.genSaltSync());
        resolve(hash);
    });
}

const checkPassword = (password) => {
    return new Promise((resolve, reject) => {
        // verifico che la password abbia almeno 8 caratteri e almeno un numero
        const pattern = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
        resolve(pattern.test(password));
    });
}

const hashPassword = (password) => {
    return new Promise((resolve, reject) => {
        if (!checkPassword) reject("The password doesn't respect the conditions");
        else {
            const hash = bcrypt.hashSync(password, bcrypt.genSaltSync());
            resolve(hash);
        }
    })
}

router.post('/', async (req, res) => {
    var [ username, email, password ] = [ req.body.username, req.body.email, req.body.password ];

    console.log(username, email, password, await emailExists(email), await usernameExists(username));
    
    if (username && email && password && !await emailExists(email) && !await usernameExists(username)) {
        await generateAccountId(username, password).then(async (idaccount) => {
            await hashPassword(password).then(async (hashedPsw) => {
                await db.getConnection(async (err, connection) => {
                    await connection.query("INSERT INTO account (idaccount, username, email, password) VALUES (?, ?, ?, ?)", [idaccount, username, email, hashedPsw], (error, results) => {
                        connection.release();
                        if (error) {
                            console.log(error);
                            res.json({status:false, message:"An error occurred while creating your account, please try again later"});
                        } else {
                            res.json({status:true, message:"Account created successfully"});
                        }
            
                    });
                });
            })
            .catch((error) => { res.json({status:false, message:error}); })
        }).catch((error) => { res.json({status:false, message:error}); res.end(); });
    } else {
        res.json({status:false, message:"Please enter all data correctly"});
        res.end();
    }
});

module.exports = router;