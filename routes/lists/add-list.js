const express = require('express');
const validateToken = require('../../middleware/validate-token');
const { supabase } = require('../../db');
const router = express.Router();
const errors = require('../../utils/errors');

router.use(express.json());
router.post('/', validateToken, async (req, res) => {
    var name = req.body.name;
    var idaccount = req.account;

    // if (idaccount && name) {
    //     db.getConnection(async (err, connection) => {
    //         connection.query("INSERT INTO lists (idaccount, name) VALUES (?, ?)", [idaccount, name], (error, results, fields) => {
    //             connection.release();
    //             if (error) {
    //                 console.log(error);
    //                 // res.json({status:false, message:"An error occured while creating the list, please try again later"});
    //                 res.status(500).json({message:errors.global.queryError});
    //             } else {
    //                 // res.json({status:true, message:"List created successfully"});
    //                 res.status(200).json({});
    //             }
    //         });
    //     });
    // } else {
    //     // res.json({status:false, message:"Please enter all data correctly"});
    //     res.status(400).json({message:errors.global.dataError});
    // }

    if (!idaccount || !name) return res.status(400).json({message:errors.global.dataError});
    let {error} = await supabase.from('lists').insert({idaccount, name});
    if (error) return res.status(500).json({message:errors.global.queryError});
    return res.status(200).json({});
});

module.exports = router;