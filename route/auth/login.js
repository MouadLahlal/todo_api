const express = require('express');
const db = require('../../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const router = express.Router();

router.use(express.json());

const validateToken = (req, res, next) => {
    try {
        var authHeader = req.headers["authorization"];
        var token = authHeader.split(" ")[1];
    } catch (error) {}

    if (!token) {
        res.json({status:false, message:"You're not authorized to use this endpoint"});
        res.end();
    } else {
        jwt.verify(token, process.env.SECRET_TOKEN, (err, user) => {
            if (err) {
                res.json({status:false, message:"An error occured while checking your authorization"});
                res.end();
            } else {
                console.log(user);
                req.account = user;
                next();
            }
        });
    }
}

router.post('/', (req, res) => {
    var [ username, password ] = [ req.body.username, req.body.password ];

    if (username && password) {
        db.getConnection(async (err, connection) => {
            if (err) console.log(err);
            connection.query("SELECT * FROM account WHERE username = ?", [username], async (error, results) => {
                connection.release();
                
                if (error) {
                    res.json({status:false, message:"There was an error logging into your account, please try again later"});
                } else if (results.length > 0) {
                    if(bcrypt.compareSync(password, results[0].password)){
                        let accessToken = jwt.sign(results[0].idaccount, process.env.SECRET_TOKEN);
                        res.json({status:true, message:"Login successful", idaccount:results[0].idaccount, accessToken:accessToken});
                    } else {
                        res.json({status:false, message:"Your credentials are incorrect, please try again"});    
                    }
                } else {
                    res.json({status:false, message:"Your credentials are incorrect, please try again"});
                }
    
                res.end();
            });
        });
    } else {
        res.json({status:false, message:"Please enter all data correctly and try again"});
        res.end();
    }
});

router.post('/checkLogged', validateToken, (req, res) => {
    var idaccount = req.body.account;

    console.log(req.body);

    if (idaccount) {
        db.getConnection(async (err, connection) => {
            if(err)console.log(err);
            connection.query("SELECT * FROM account WHERE idaccount=?", [idaccount], (error, results) => {
                connection.release();
                if (error) {
                    res.json({status:false, message:"There was an errror checking if you're logged, please try again later"});
                } else if (results.length > 0) {
                    res.json({status:true, message:"Your credentials are correct"});
                } else {
                    res.json({status:false, message:"Your credentials are incorrect, please try again"});
                }

                res.end();
            });
        })
    } else {
        res.json({status:false, message:"Please enter all data correctly and try again"});
        res.end();
    }
});

module.exports = router;
