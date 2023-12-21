const express = require('express');
const validateToken = require('../../middleware/validate-token');
const { supabase } = require('../../db');
const errors = require('../../utils/errors');
const router = express.Router();

const usernameExists = (username) => {
    return new Promise(async (resolve, reject) => {
        // db.getConnection(async (err, connection) => {
        //     connection.query("SELECT username FROM account WHERE username = ?", [username], (error, results) => {
        //         connection.release();
        //         if (error) {
        //             console.log(error);
        //             reject("error with the query");
        //         } else if (results.length > 0) {
        //             resolve(true);
        //         } else {
        //             resolve(false);
        //         }
        //     });
        // });
        
        let {data, error} = await supabase.from('account').select('username').eq('username', username);
        if (error) reject("error with the query");
        resolve(data.length > 0 ? true : false);
    })
}

const getUsernameById = (idaccount) => {
    return new Promise(async (resolve, reject) => {
        // db.getConnection(async (err, connection) => {
        //     connection.query("SELECT username FROM account WHERE idaccount=?", [idaccount], (error, results) => {
        //         connection.release();
        //         if (error) {
        //             console.log(error);
        //             reject();
        //         } else if (results.length > 0) {
        //             resolve(results[0].username);
        //         } else {
        //             reject();
        //         }
        //     })
        // });

        let {data, error} = await supabase.from('account').select('username').eq('idaccount', idaccount);
        if (error) reject();
        if (data.length > 0) resolve(data[0].username);
        else reject();
    })
}

router.use(express.json());
router.patch('/', validateToken, async (req, res) => {
    var [newUsername, idaccount] = [req.body.newUsername, req.account];
    var username, isUsername;
    
    await getUsernameById(idaccount)
        .then((value) => username = value)
        .catch((error) => res.status(500).json({message:errors.global.queryError}));
    await usernameExists(newUsername)
        .then((value) => isUsername = value)
        .catch((error) => res.status(500).json({message:errors.global.queryError}));

    // if (newUsername && !isUsername && idaccount && username) {
    //     db.getConnection((err, connection) => {
    //         connection.query("UPDATE account SET username=? WHERE idaccount=?", [newUsername, idaccount], (error, results) => {
    //             connection.release();
    //             if (error) {
    //                 console.log(error);
    //                 res.status(500).json({message:errors.global.queryError});
    //             } else {
    //                 res.status(200).json({});
    //             }
    //         });
    //     });
    // } else {
    //     res.status(400).json({message:errors.global.dataError});
    // }

    if (!newUsername || isUsername || !idaccount || !username) return res.status(400).json({message:errors.global.dataError});
    let {error} = await supabase.from('account').update({newUsername}).eq('idaccount', idaccount);
    if (error) return res.status(500).json({message:errors.global.queryError});
    return res.status(200).json({});
});

module.exports = router;