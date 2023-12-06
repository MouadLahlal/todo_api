const validateToken = require('../../middleware/validate-token');
const db = require('../../db');
const express = require('express');
const router = express.Router();
const errors = require('../../utils/errors');

router.use(express.json());
router.put('/', validateToken, async (req, res) => {
    var [ idtask, task, note, expiration, priority, done, list ] = [ req.body.idtask, req.body.task, req.body.note, req.body.expiration, req.body.priority, req.body.done, req.body.list ];
    var idaccount = req.account;

    if (task && list && idaccount && idtask) {
        db.getConnection(async (err, connection) => {
            const values = [idtask, idaccount];
            const query = `UPDATE tasks SET ${task?"task=?,":""}${list?"list=?,":""}${note?"note=?,":""}${expiration?"expiration=?,":""}${priority?"priority=?,":""} WHERE idtask=? AND idaccount=?`;
            if (priority) values.unshift(priority);
            if (expiration) values.unshift(expiration);
            if (note) values.unshift(note);
            if (list) values.unshift(list);
            if (task) values.unshift(task);
            connection.query(`UPDATE tasks SET task = ?, list = ?, note = ?, expiration = ?, priority = ? WHERE idtask = ? AND idaccount = ?`, [task, list, note, expiration, priority, idtask, idaccount], (error, results, fields) => {
                connection.release();
                if (error) {
                    console.log(error);
                    // res.json({status:false, message:"An error occurred while modifying the task, please try again later"});
                    res.status(500).json({message:errors.global.queryError});
                } else {
                    // res.json({status:true, message:"Task modified successfully"});
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