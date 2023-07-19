const express = require('express');
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

router.post('/add', validateToken, async (req, res) => {
    var [ task, note, expiration, priority, list ] = [ req.body.task, req.body.note, req.body.expiration, req.body.priority, req.body.list ];
    var idaccount = req.account;

    console.log(req.account);

    if (task && list && idaccount) {
        db.getConnection(async (err, connection) => {
            connection.query(`INSERT INTO tasks (idaccount, task, list, done ${note?", note":""}${expiration?", expiration":""}${priority?", priority":""}) VALUES (?, ?, ?, FALSE ${note?", ?":""}${expiration?", ?":""}${priority?", ?":""})`, [idaccount, task, list, note, expiration, priority], (error, results, fields) => {
                connection.release();
                if (error) {
                    console.log(error);
                    res.json({status:false, message:"An error occurred while creating the task, please try again later"});
                } else {
                    res.json({status:true, message:"Task created successfully"});
                }
    
                res.end();
            });
        });
    } else {
        res.json({status:false, message:"Please enter all data correctly"});
        res.end();
    }
});

router.post('/modify', validateToken, async (req, res) => {
    var [ idtask, task, note, expiration, priority, done, list ] = [ req.body.idtask, req.body.task, req.body.note, req.body.expiration, req.body.priority, req.body.done, req.body.list ];
    var idaccount = req.account;

    if (task && list && idaccount && idtask) {
        // QUERY
        // `UPDATE tasks SET task = ?, list = ? ${note?", note = ?":""}${expiration?", expiration = ?":""}${priority?", priority = ?":""}${done?`, done = ${done==='true'?'TRUE':'FALSE'}`:""} WHERE idtask = ? AND idaccount = ?`
        db.getConnection(async (err, connection) => {
            connection.query(`UPDATE tasks SET task = ?, list = ?, note = ?, expiration = ?, priority = ? , done = ${done==='true'?'TRUE':done==='false'?'FALSE':''} WHERE idtask = ? AND idaccount = ?`, [task, list, note, expiration, priority, idtask, idaccount], (error, results, fields) => {
                connection.release();
                if (error) {
                    console.log(error);
                    res.json({status:false, message:"An error occurred while modifying the task, please try again later"});
                } else {
                    res.json({status:true, message:"Task modified successfully"});
                }
    
                res.end();
            });
        });
    } else {
        res.json({status:false, message:"Please enter all data correctly"});
        res.end();
    }
});

router.post('/:idtask/delete', validateToken, async (req, res) => {
    var [ idtask ] = [ req.params.idtask ];
    var idaccount = req.account;

    if (idaccount && idtask) {
        db.getConnection(async (err, connection) => {
            connection.query('DELETE FROM tasks WHERE idaccount=? AND idtask=?', [idaccount, idtask], (error, results) => {
                connection.release();
                if (error) {
                    console.log(error);
                    res.json({status:false, message:"An errror occured while deleting the task, please try again later"});
                } else if (results.affectedRows != 0) {
                    res.json({status:true, message:"Task deleted successfully"});
                } else {
                    res.json({status:false, message:"You do not have permission to delete this task or this task does not exist"});
                }

                res.end();
            });
        })
    }
});

router.post('/:idtask/done', validateToken, async (req, res) => {
    var idaccount = req.account;
    var idtask = req.params.idtask;

    if (idaccount && idtask) {
        db.getConnection(async (err, connection) =>{
            let temp = new Date();
            let today = `${temp.getFullYear()}-${temp.getMonth()+1}-${temp.getDate()}`;
            connection.query("UPDATE tasks SET done=?, completedon=? WHERE idaccount=? AND idtask=? AND done=0", [1, today, idaccount, idtask], (error, results) => {
                if (error) {
                    console.log(error);
                    res.json({status:false, message:"An error occured while setting as completed the task"});
                } else if (results.affectedRows != 0) {
                    res.json({status:true, message:"Action performed correctly"});
                } else {
                    res.json({status:false, message:"You do not have permission to complete this task or this task is already done"})
                }

                res.end();
            });
        });
    }
});

router.post('/:idtask/undone', validateToken, async (req, res) => {
    var idaccount = req.account;
    var idtask = req.params.idtask;

    if (idaccount && idtask) {
        db.getConnection(async (err, connection) =>{
            let temp = new Date();
            connection.query("UPDATE tasks SET done=?, completedon=? WHERE idaccount=? AND idtask=? AND done=0", [1, null, idaccount, idtask], (error, results) => {
                if (error) {
                    console.log(error);
                    res.json({status:false, message:"An error occured while setting as completed the task"});
                } else if (results.affectedRows != 0) {
                    res.json({status:true, message:"Action performed correctly"});
                } else {
                    res.json({status:false, message:"You do not have permission to complete this task or this task is already done"})
                }

                res.end();
            });
        });
    }
});

module.exports = router;
