const express = require('express');
const validateToken = require('../../middleware/validate-token');
const { supabase } = require('../../db');
const router = express.Router();
const errors = require('../../utils/errors');

router.use(express.json());
router.delete('/:idlist', validateToken, async (req, res) => {
    var idlist = req.params.idlist;
    var idaccount = req.account;

    // if (idaccount && idlist) {
    //     db.getConnection(async (err, connection) => {
    //         connection.query("DELETE FROM lists WHERE idaccount=? AND idlist=?", [idaccount, idlist], (error, results) => {
    //             connection.release();
                
    //             if (error) {
    //                 console.log(error);
    //                 // res.json({status:false, message:"An error occured while deleting the list, please try again later"});
    //                 res.status(500).json({message:errors.global.queryError});
    //             } else {
    //                 // res.json({status:true, message:"List delete correctly"});
    //                 res.status(200).json({});
    //             }
    //         });
    //     });
    // }

    if (!idaccount || !idlist) return res.status(400).json({message:errors.global.dataError});
    let {error} = await supabase.from('lists').delete('*').eq('idaccount', idaccount).eq('idlist', idlist);
    if (error) return res.status(500).json({message:errors.global.queryError});
    return res.status(200).json({});
});

module.exports = router;