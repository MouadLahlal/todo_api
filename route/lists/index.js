const express = require('express');
const mysql = require('mysql');
const db = require('../../db');
const jwt = require('jsonwebtoken');

const router = express.Router();

router.use(express.json());

/**
 * validate the token that give access to some private resources
 */
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

/**
 * returns all lists associated with the user
 */
router.get('/getAll', validateToken, async (req, res) => {
    var idaccount = req.account.idaccount;

    if (idaccount) {
        db.getConnection(async (err, connection) => {
            await connection.query("SELECT * FROM lists WHERE idaccount = ?", [idaccount], (error, results, fiels) => {
                connection.release();
                if (error) {
                    console.log(error);
                    res.json({status:false, message:"An error occured while getting lists, please try again later"});
                } else if (results.length > 0) {
                    res.json({status:true, message:"Action perfomed correctly", content:results});
                } else {
                    res.json({status:false, message:"Action performed correctly but no list found"});
                }
    
                res.end();
            });
        });
    } else {
        res.json({status:false, message:"no idaccount"});
        res.end();
    }
});

/**
 * returns all tasks saved in the given list
 */
router.get('/:list', validateToken, async (req, res) => {
    var list = req.params.list;
    var idaccount = req.account.idaccount;

    if (idaccount && list) {
        db.getConnection(async (err, connection) => {
            await connection.query("SELECT * FROM tasks WHERE list = ? AND idaccount = ?", [list, idaccount], (error, results, fields) => {
                connection.release();
                if (error) {
                    console.log(error);
                    res.json({status:false, message:"An error occurred while getting tasks, please try again later"});
                } else if (results.length > 0) {
                    res.json({status:true, message:"Action performed correctly", content:results});
                } else {
                    res.json({status:false, message:"Action performed successfully but no task found"});
                }
    
                res.end();
            });
        });
    } else {
        res.json({status:false, message:"Please enter all data correctly"});
        res.end();
    }
});

/**
 * returns the tasks to be completed that day
 */
router.get('/getToday', validateToken, async (req, res) => {
    var idaccount = req.account.idaccount;

    if (idaccount) {
        db.getConnection(async (err, connection) => {
            let temp = new Date();
            let today = `${temp.getFullYear()}-${temp.getMonth()+1}-${temp.getDate()}`;
            console.log(today);
            await connection.query("SELECT * FROM tasks WHERE idaccount=? AND expiration=?", [idaccount, today], (error, results) => {
                connection.release();
                if (error) {
                    console.log(error);
                    res.json({status:false, message:"An error occured while getting tasks, please try again later"});
                } else if (results.length > 0) {
                    res.json({status:false, message:"Action performed correctly", content:results});
                } else {
                    res.json({status:false, message:"Action performed successfully but no task found"});
                }

                res.end();
            });
        });
    }
});

/**
 * returns tasks marked as important
 */
router.get('/getImportant', validateToken, async (req, res) => {
    var idaccount = req.account.idaccount;

    if (idaccount) {
        db.getConnection(async (err, connection) => {
            await connection.query("SELECT * FROM tasks WHERE idaccount=? AND priority=4", [idaccount], (error, results) => {
                connection.release();
                if (error) {
                    console.log(error);
                    res.json({status:false, message:"An error occured while getting tasks, please try again later"});
                } else if (results.length > 0) {
                    res.json({status:true, message:"Action perfomed correctly", content:results});
                } else {
                    req.json({status:false, message:"Action perfomed successfully but no task found"});
                }

                res.end();
            });
        });
    }
});

/**
 * create a new list
 */
router.post('/add', validateToken, async (req, res) => {
    var name = req.body.name;
    var idaccount = req.account.idaccount;

    if (idaccount && name) {
        db.getConnection(async (err, connection) => {
            await connection.query("INSERT INTO lists (idaccount, name) VALUES (?, ?)", [idaccount, name], (error, results, fields) => {
                connection.release();
                if (error) {
                    console.log(error);
                    res.json({status:false, message:"An error occured while creating the list, please try again later"});
                } else {
                    res.json({status:true, message:"List created successfully"});
                }
    
                res.end();
            });
        });
    } else {
        res.json({status:false, message:"Please enter all data correctly"});
        res.end();
    }
});

/**
 * modify an existing list
 */
router.post('/modify', validateToken, async (req, res) => {
    var [ idlist, newname ] = [ req.body.idlist, req.body.newname ];
    var idaccount = req.account.idaccount;

    if (idaccount && idlist && newname) {
        db.getConnection(async (err, connection) => {
            await connection.query("UPDATE lists SET name = ? WHERE idaccount = ? AND idlist = ?", [newname, idaccount, idlist], (error, results, fields) => {
                connection.release();
                if (error) {
                    console.log(error);
                    res.json({status:false, message:"An error occured while modifying the list, please try again later"});
                } else {
                    res.json({status:true, message:"List modified correctly"});
                }
    
                res.end();
            });
        });
    } else {
        res.json({status:false, message:"Please enter all data correctly"});
        res.end();
    }
});

/**
 * delete a list
 */
router.post('/delete', validateToken, async (req, res) => {
    var idlist = req.body.idlist;
    var idaccount = req.account.idaccount;

    if (idaccount && idlist) {
        db.getConnection(async (err, connection) => {
            await connection.query("DELETE FROM lists WHERE idaccount=? AND idlist=?", [idaccount, idlist], (error, results) => {
                connection.release();
                
                if (error) {
                    console.log(error);
                    res.json({status:false, message:"An error occured while deleting the list, please try again later"});
                } else {
                    res.json({status:true, message:"List delete correctly"});
                }

                res.end();
            });
        });
    }
});

module.exports = router;