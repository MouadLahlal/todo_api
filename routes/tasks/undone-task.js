const express = require('express');
const validateToken = require('../../middleware/validate-token');
const { supabase } = require('../../db');
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

    // if (idaccount && idtask) {
    //     db.getConnection(async (err, connection) =>{
    //         connection.query("UPDATE tasks SET done=?, completedon=? WHERE idaccount=? AND idtask=? AND done=1", [0, null, idaccount, idtask], (error, results) => {
    //             if (error) {
    //                 console.log(error);
    //                 // res.json({status:false, message:"An error occured while setting as completed the task"});
    //                 res.status(500).json({message:errors.global.queryError});
    //             } else if (results.affectedRows != 0) {
    //                 // res.json({status:true, message:"Action performed correctly"});
    //                 res.status(200).json({});
    //             } else {
    //                 // res.json({status:false, message:"You do not have permission to complete this task or this task is already done"})
    //                 tasksExist(connection, idaccount, idtask).then((exist) => {
    //                     if (exist) res.status(400).json({message:errors.tasks.taskAlreadyUndone});
    //                     else res.status(404).json({message:errors.tasks.taskNotFound});
    //                 }).catch(() => {
    //                     res.status(500).json({message:errors.global.queryError});
    //                 });
    //             }
    //         });
    //     });
    // }

    if (!idaccount || !idtask) return res.status(400).json({message:errors.global.dataError});
    let {error} = await supabase.from('tasks').update({done: false, completedon: null}).eq('idaccount', idaccount).eq('idtask', idtask).eq('done', true);
    if (error) return res.status(500).json({message:errors.global.queryError});
    return res.status(200).json({});
});

module.exports = router;