const express = require('express');
const validateToken = require('../../middleware/validate-token');
const { supabase } = require('../../db');
const router = express.Router();
const errors = require('../../utils/errors');

router.use(express.json());
router.get('/', validateToken, async (req, res) => {
    var idaccount = req.account;

    // if (idaccount) {
    //     db.getConnection(async (err, connection) => {
    //         console.log(idaccount);
    //         connection.query("SELECT * FROM tasks WHERE idaccount=? AND priority=? and done=?", [idaccount, 'HIGH', 0], (error, results) => {
    //             connection.release();
    //             if (error) {
    //                 console.log(error);
    //                 // res.json({status:false, message:"An error occured while getting tasks, please try again later"});
    //                 res.status(500).json({message:errors.global.queryError});
    //             } else if (results.length > 0) {
    //                 // res.json({status:true, message:"Action perfomed correctly", content:results});
    //                 res.status(200).json({content:results});
    //             } else {
    //                 // res.json({status:false, message:"Action perfomed successfully but no task found"});
    //                 res.status(404).json({message:errors.lists.noTaskFound});
    //             }
    //         });
    //     });
    // }

    let {data, error} = await supabase.from('tasks').select('*').eq('idaccount', idaccount).eq('priority', 'HIGH').eq('done', false);
    if (error) return res.status(500).json({message:errors.global.queryError});
    if (data.length > 0) return res.status(200).json({content:data});
    else return res.status(404).json({message:errors.lists.noTaskFound});
});

module.exports = router;