const express = require('express');
const db = require('../../db');
const bcrypt = require('bcrypt');
const errors = require('../../utils/errors');

const router = express.Router();

router.use(express.json());

const emailExists = (email) => {
    return new Promise((resolve, reject) => {
        db.getConnection(async (err, connection) => {
            connection.query("SELECT email FROM account WHERE email = ?", [email], (error, results, fields) => {
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
            connection.query("SELECT username FROM account WHERE username = ?", [username], (error, results, fields) => {
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
    return new Promise(async (resolve, reject) => {
        let pswChecked = await checkPassword(password);
        if (!pswChecked) reject("The password doesn't respect the conditions");
        else {
            const hash = bcrypt.hashSync(password, bcrypt.genSaltSync());
            resolve(hash);
        }
    })
}

router.post('/', async (req, res) => {
    var [ username, email, password ] = [ req.body.username, req.body.email, req.body.password ];
    
    if (username && email && password && !await emailExists(email) && !await usernameExists(username)) {
        await generateAccountId(username, password).then(async (idaccount) => {
            await hashPassword(password).then(async (hashedPsw) => {
                db.getConnection(async (err, connection) => {
                    if (err) console.log(err);
                    connection.query("INSERT INTO account (idaccount, username, email, password) VALUES (?, ?, ?, ?)", [idaccount, username, email, hashedPsw], async (error, results) => {
                        connection.release();
                        if (error) {
                            console.log(error);
                            // res.json({status:false, message:"An error occurred while creating your account, please try again later"});
                            res.status(500).json({message:errors.auth.signupFail});
                        } else {
                            // res.json({status:true, message:"Account created successfully"});
                            res.status(200);
                        }
                    });
                });
            })
            .catch((error) => { res.status(400).json({message:error}); })
        }).catch((error) => { res.status(500).json({message:error}); });
    } else {
        res.status(400).json({message:"Please enter all data correctly"});
    }
});

module.exports = router;