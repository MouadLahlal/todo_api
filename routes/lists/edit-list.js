const express = require('express');
const validateToken = require('../../middleware/validate-token');
const { supabase } = require('../../db');
const router = express.Router();
const errors = require('../../utils/errors');

const getListNameById = (idaccount, id) => {
    return new Promise(async (resolve, reject) => {
        let {data, error} = await supabase.from('lists').select('*').eq('idaccount', idaccount).eq('idlist', id);
        if (error) reject();
        resolve(data.length > 0 ? true : false);
    });
}

const listExist = (idaccount, name) => {
    return new Promise(async (resolve, reject) => {
        // db.getConnection((err, connection) => {
        //     if (err) reject({statusCode:500, message:errors.global.connError});
        //     connection.query("SELECT * FROM lists WHERE idaccount=? AND name=?", [idaccount, name], (error, results) => {
        //         if (error) reject({statusCode:500, message:errors.global.queryError});
        //         results.length > 0 ? resolve(true) : resolve(false);
        //     });
        // });

        let {data, error} = await supabase.from('lists').select('*').eq('idaccount', idaccount).eq('name', name);
        if (error) reject();
        resolve(data.length > 0 ? true : false);
    });
}

router.use(express.json());
router.put('/:idlist', validateToken, async (req, res) => {
    var idlist = req.params.idlist;
    var idaccount = req.account;
    var { newname, newicon } = req.body;
    var oldname = await getListNameById(idlist);
    var oldListExists = await listExist(idaccount, oldname);
    var newListExists = await listExist(idaccount, newname);

    // if (idaccount && oldname && newname && oldListExists === true && newListExists === false) {
    //     db.getConnection(async (err, connection) => {
    //         connection.query("UPDATE tasks SET list=? WHERE idaccount=? AND list=?", [newname, idaccount, oldname], (error, results) => {
    //             if (error) {
    //                 console.log(error);
    //                 res.status(500).json({message:errors.global.queryError});
    //             } else {
    //                 connection.query("UPDATE lists SET name = ?, icon = ? WHERE idaccount = ? AND name = ?", [newname, newicon, idaccount, oldname], (error, results, fields) => {
    //                     connection.release();
    //                     if (error) {
    //                         console.log(error);
    //                         // res.json({status:false, message:"An error occured while modifying the list, please try again later"});
    //                         res.status(500).json({message:errors.global.queryError});
    //                     } else {
    //                         // res.json({status:true, message:"List modified correctly"});
    //                         res.status(200).json({});
    //                     }
    //                 });
    //             }
    //         });
    //     });
    // } else {
    //     // res.json({status:false, message:"Please enter all data correctly"});
    //     res.status(400).json({message:errors.global.dataError});
    // }

    if (!idaccount || oldListExists || !newname || newListExists) return res.status(400).json({message:errors.global.dataError});
    let {error} = await supabase.from('tasks').update({list: newname}).eq('idaccount', idaccount).eq('list', oldname);
    if (error) return res.status(500).json({message:errors.global.queryError});
    ({error} = await supabase.from('lists').update({name: newname, icon: newicon}).eq('idaccount', idaccount).eq('idlist', idlist));
    if (error) return res.status(500).json({message:errors.global.queryError});
    return res.status(200).json({});
});

module.exports = router;