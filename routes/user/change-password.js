const express = require('express');
const bcrypt = require('bcrypt');
const validateToken = require('../../middleware/validate-token');
const db = require('../../db');
const errors = require('../../utils/errors');
const router = express.Router();

const accountExists = (username, password) => {
    return new Promise((resolve, reject) => {
        db.getConnection((err, connection) => {
            connection.query("SELECT * FROM account WHERE username=?", [username], (error, results) => {
                if (error) {
                    reject();
                } else if (results.length > 0) {
                    bcrypt.compare(password, results[0].password).then((value) => resolve(value));
                } else {
                    resolve(false);
                }
            });
        });
    });
}

const getUsernameById = (idaccount) => {
    return new Promise((resolve, reject) => {
        db.getConnection(async (err, connection) => {
            connection.query("SELECT username FROM account WHERE idaccount=?", [idaccount], (error, results) => {
                connection.release();
                if (error) {
                    console.log(error);
                    reject();
                } else if (results.length > 0) {
                    resolve(results[0].username);
                } else {
                    reject();
                }
            })
        })
    })
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

router.use(express.json());
router.patch('/', validateToken, async (req, res) => {
    var [oldPassword, newPassword, idaccount] = [req.body.oldPassword, req.body.newPassword, req.account];
    var username, isAccount;
    await getUsernameById(idaccount).then((usr) => username = usr )
        .catch((error) => res.status(500).json({message:errors.global.queryError}));
    await accountExists(username, oldPassword).then((value) => isAccount = value)
        .catch((error) => res.status(500).json({message:errors.global.queryError}));
    
    console.log(oldPassword, newPassword, isAccount, await accountExists(username, oldPassword));

    if (oldPassword && newPassword && idaccount && username && isAccount) {
        hashPassword(newPassword).then((psw) => {
            db.getConnection((err, connection) => {
                connection.query("UPDATE account SET password=? WHERE idaccount=?", [psw, idaccount], (error, results) => {
                    if (error) {
                        console.log(error);
                        res.status(500).json({message:errors.global.queryError});
                    } else {
                        res.status(200).json({});
                    }
                })
            })
        }).catch(() => {
            res.status(400).json({message:errors.global.dataError});
        })
    } else {}
});

module.exports = router;