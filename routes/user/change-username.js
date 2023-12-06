const express = require('express');
const validateToken = require('../../middleware/validate-token');
const db = require('../../db');
const errors = require('../../utils/errors');
const router = express.Router();

const usernameExists = (username) => {
    return new Promise((resolve, reject) => {
        db.getConnection(async (err, connection) => {
            connection.query("SELECT username FROM account WHERE username = ?", [username], (error, results) => {
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

router.use(express.json());
router.patch('/', validateToken, async (req, res) => {
    var [newUsername, idaccount] = [req.body.newUsername, req.account];
    var username, isUsername;
    await getUsernameById(idaccount).then((value) => username = value)
        .catch((error) => res.status(500).json({message:errors.global.queryError}));
    await usernameExists(newUsername).then((value) => isUsername = value)
        .catch((error) => res.status(500).json({message:errors.global.queryError}));

    if (newUsername && !isUsername && idaccount && username) {
        db.getConnection((err, connection) => {
            connection.query("UPDATE account SET username=? WHERE idaccount=?", [newUsername, idaccount], (error, results) => {
                connection.release();
                if (error) {
                    console.log(error);
                    res.status(500).json({message:errors.global.queryError});
                } else {
                    res.status(200).json({});
                }
            });
        });
    } else {
        res.status(400).json({message:errors.global.dataError});
    }
});

module.exports = router;