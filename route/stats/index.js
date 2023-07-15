const express = require('express');
const mysql = require('mysql');
const db = require('../../db');
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
                req.account = user;
                next();
            }
        });
    }
}

const getTotalTasks = (connection, idaccount) => {
    return new Promise((resolve, reject) => {
        connection.query("SELECT * FROM tasks WHERE idaccount=?", [idaccount], (error, results) => {
            if (error) {
                reject();
            } else {
                resolve(results.length);
            }
        });
    });
}

const getTodaysTasks = (connection, idaccount) => {
    return new Promise((resolve, reject) => {
        let temp = new Date();
        let today = `${temp.getFullYear()}-${temp.getMonth()+1}-${temp.getDate()}`;
        connection.query("SELECT * FROM tasks WHERE idaccount=? AND expiration=?", [idaccount, today], (error, results) => {
            if (error) {
                reject();
            } else {
                resolve(results.length);
            }
        });
    });
}

const getTodaysCompTasks = (connection, idaccount) => {
    return new Promise((resolve, reject) => {
        let temp = new Date();
        let today = `${temp.getFullYear()}-${temp.getMonth()+1}-${temp.getDate()}`;
        connection.query("SELECT * FROM tasks WHERE idaccount=? AND completedon=?", [idaccount, today], (error, results) => {
            if (error) {
                reject();
            } else {
                resolve(results.length);
            }
        });
    });
}

router.get('/getProgress', validateToken, async (req, res) => {
    var idaccount = req.account;

    if (idaccount) {
        db.getConnection(async (err, connection) => {
            await connection.query("SELECT * FROM tasks WHERE idaccount=?" , [idaccount], async (error, results) => {
                if (error) {
                    res.json({status:false, message:"An error occured while executing a query, please try again later"});
                    connection.release();
                    res.end();
                } else {
                    let nTasks = results.length;
                    await connection.query("SELECT * FROM tasks WHERE idaccount=? AND done=1", [idaccount], async (error, results) => {
                        connection.release();
                        if (error) {
                            res.json({status:false, message:"An error occured while executing a query, please try again later"});
                        } else {
                            res.json({status:true, message:"Action perfomed correctly", progress:(nTasks === 0 ? 0 : results.length/nTasks), totTasks:nTasks, compTasks:results.length});
                        }
                        res.end();
                    });
                }
            });
        });
    } else {
        res.json({status:false, message:"There was an error checking your account"});
        res.end();
    }
});

router.get('/getStatistic', validateToken, async (req, res) => {
    var idaccount = req.account;

    if (idaccount) {
        db.getConnection(async (err, connection) => {
            await connection.query("SELECT * FROM tasks WHERE idaccount=? AND done=?", [idaccount, 1], async (error, results) => {
                if (error) {
                    res.json({status:false, message:"An error occured while creating the statistics"});
                } else {
                    let totTasks = await getTotalTasks(connection, idaccount);
                    let todTasks = await getTodaysTasks(connection, idaccount);
                    let todCompTasks = await getTodaysCompTasks(connection, idaccount);
                    res.json({status:false, message:"Action perfomed correctly", totTasks, todTasks, todCompTasks});
                }

                res.end();
            });
        });
    } else {
        res.json({status:false, message:"There was an error checking your account"});
        res.end();
    }
});

module.exports = router;