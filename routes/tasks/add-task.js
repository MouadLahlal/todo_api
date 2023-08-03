const express = require('express');
const validateToken = require('../../middleware/validate-token');
const db = require('../../db');
const router = express.Router();
const errors = require('../../utils/errors');

router.use(express.json());
/**
 * A route bro
 * @route POST /tasks/add
 */
router.post('/', validateToken, async (req, res) => {
    var [ task, note, expiration, priority, list ] = [ req.body.task, req.body.note, req.body.expiration, req.body.priority, req.body.list ];
    var idaccount = req.account;

    if (task && list && idaccount) {
        db.getConnection(async (err, connection) => {
            const values = [idaccount, task, list];
            const query = `INSERT INTO tasks (idaccount, task, list, done ${note?", note":""}${expiration?", expiration":""}${priority?", priority":""}) VALUES (?, ?, ?, FALSE ${note?", ?":""}${expiration?", ?":""}${priority?", ?":""})`
            if (note) values.push(note);
            if (expiration) values.push(expiration);
            if (priority) values.push(priority);
            connection.query(query, values, (error, results, fields) => {
                connection.release();
                if (error) {
                    console.log(error);
                    // res.json({status:false, message:"An error occurred while creating the task, please try again later"});
                    res.status(500).json({message:errors.global.queryError});
                } else {
                    // res.json({status:true, message:"Task created successfully"});
                    res.status(200).json({});
                }
            });
        });
    } else {
        // res.json({status:false, message:"Please enter all data correctly"});
        res.status(400).json({message:errors.global.dataError});
    }
});

module.exports = router;