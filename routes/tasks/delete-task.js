const express = require('express');
const validateToken = require('../../middleware/validate-token');
const { supabase } = require('../../db');
const router = express.Router();
const errors = require('../../utils/errors');

router.use(express.json());
router.delete('/:idtask', validateToken, async (req, res) => {
    var [ idtask ] = [ req.params.idtask ];
    var idaccount = req.account;

    // if (idaccount && idtask) {
    //     db.getConnection(async (err, connection) => {
    //         connection.query('DELETE FROM tasks WHERE idaccount=? AND idtask=?', [idaccount, idtask], (error, results) => {
    //             connection.release();
    //             if (error) {
    //                 console.log(error);
    //                 // res.json({status:false, message:"An errror occured while deleting the task, please try again later"});
    //                 res.status(500).json({message:errors.global.queryError});
    //             } else if (results.affectedRows != 0) {
    //                 // res.json({status:true, message:"Task deleted successfully"});
    //                 res.status(200).json({});
    //             } else {
    //                 // res.json({status:false, message:"You do not have permission to delete this task or this task does not exist"});
    //                 res.status(404).json({message:errors.tasks.taskNotFound});
    //             }
    //         });
    //     })
    // }

    if (!idaccount || !idtask) return res.status(400).json({message:errors.global.dataError});
    let {error} = await supabase.from('tasks').delete('*').eq('idaccount', idaccount).eq('idtask', idtask);
    if (error) return res.status(500).json({message:errors.global.queryError});
    return res.status(200).json({});
});

module.exports = router;