const express = require('express');
const validateToken = require('../../middleware/validate-token');
const db = require('../../db');
const router = express.Router();
const errors = require('../../utils/errors');

const tasksExist = (connection, idaccount, idtask) => {
    return new Promise((resolve, reject) => {
        connection.query("SELECT * FROM tasks WHERE idaccount=? AND idtask=?", [idaccount, idtask], (error, results) => {
            if (error) reject();
            else if (results.length > 0) resolve(true);
            else resolve(false);
        })
    });
}

router.use(express.json());
router.patch('/:idtask', validateToken, async (req, res) => {
    var idaccount = req.account;
    var idtask = req.params.idtask;

    if (idaccount && idtask) {
        db.getConnection(async (err, connection) =>{
            let temp = new Date();
            let today = `${temp.getFullYear()}-${temp.getMonth()+1}-${temp.getDate()}`;
            connection.query("UPDATE tasks SET done=?, completedon=? WHERE idaccount=? AND idtask=? AND done=0", [1, today, idaccount, idtask], (error, results) => {
                console.log(results.affectedRows);
                if (error) {
                    console.log(error);
                    // res.json({status:false, message:"An error occured while setting as completed the task"});
                    res.status(500).json({message:errors.global.queryError});
                } else if (results.affectedRows != 0) {
                    // res.json({status:true, message:"Action performed correctly"});
                    res.status(200).json({});
                } else {
                    // res.json({status:false, message:"You do not have permission to complete this task or this task is already done"})
                    // res.status().json({message:errors.tasks.taskAlreadyDone});
                    tasksExist(connection, idaccount, idtask).then((exist) => {
                        if (exist) res.status(400).json({message:errors.tasks.taskAlreadyDone});
                        else res.status(404).json({message:errors.tasks.taskNotFound});
                    }).catch(() => {
                        res.status(500).json({message:errors.global.queryError});
                    });
                }
            });
        });
    }
});

module.exports = router;