const express = require('express');
const validateToken = require('../../middleware/validate-token');
const { supabase } = require('../../db');
const router = express.Router();
const errors = require('../../utils/errors');

router.use(express.json());
router.get('/:list', validateToken, async (req, res) => {
    var list = req.params.list;
    var idaccount = req.account;

    // if (idaccount && list) {
    //     db.getConnection(async (err, connection) => {
    //         connection.query("SELECT * FROM tasks WHERE list = ? AND idaccount = ?", [list, idaccount], (error, results, fields) => {
    //             connection.release();
    //             if (error) {
    //                 console.log(error);
    //                 // res.json({status:false, message:"An error occurred while getting tasks, please try again later"});
    //                 res.status(500).json({message:errors.global.queryError});
    //             } else if (results.length > 0) {
    //                 // res.json({status:true, message:"Action performed correctly", content:results});
    //                 console.log(results);
    //                 res.status(200).json({content:results});
    //             } else {
    //                 // res.json({status:false, message:"Action performed successfully but no task found"});
    //                 res.status(404).json({message:errors.lists.noTaskFound});
    //             }
    //         });
    //     });
    // } else {
    //     // res.json({status:false, message:"Please enter all data correctly"});
    //     res.status(400).json({message:errors.global.dataError});
    // }

    let {data, error} = await supabase.from('tasks').select('*').eq('list', list).eq('idaccount', idaccount);
    if (error) return res.status(500).json({message:errors.global.queryError});
    if (data.length > 0) return res.status(200).json({content:data});
    else return res.status(404).json({message:errors.lists.noTaskFound});
});

module.exports = router;