const express = require('express');
const validateToken = require('../../middleware/validate-token');
const { supabase } = require('../../db');
const errors = require('../../utils/errors');
const router = express.Router();

const emailExists = (email) => {
    return new Promise(async (resolve, reject) => {
        // db.getConnection(async (err, connection) => {
        //     connection.query("SELECT email FROM account WHERE email = ?", [email], (error, results) => {
        //         connection.release();
        //         if (error) {
        //             console.log(error);
        //             reject();
        //         } else if (results.length > 0) {
        //             resolve(true);
        //         } else {
        //             resolve(false);
        //         }
        //     });
        // });

        let {data, error} = await supabase.from('account').select('email').eq('email', email);
        if (error) reject();
        resolve(data.length > 0 ? true : false);
    })
}

const getEmailById = (idaccount) => {
    return new Promise(async (resolve, reject) => {
        // db.getConnection(async (err, connection) => {
        //     connection.query("SELECT email FROM account WHERE idaccount=?", [idaccount], (error, results) => {
        //         connection.release();
        //         if (error) {
        //             console.log(error);
        //             reject();
        //         } else if (results.length > 0) {
        //             resolve(results[0].email);
        //         } else {
        //             reject();
        //         }
        //     })
        // });

        let {data, error} = await supabase.from('account').select('email').eq('idaccount', idaccount);
        if (error) reject();
        if (data.length) resolve(data[0].email);
        else reject();
    })
}

router.use(express.json());
router.patch('/', validateToken, async (req, res) => {
    var [newEmail, idaccount] = [req.body.newEmail, req.account];
    var email, isEmail;
    
    await getEmailById(idaccount).then((value) => email = value)
        .catch((error) => res.status(500).json({message:errors.global.queryError}));
    await emailExists(newEmail).then((value) => isEmail = value)
        .catch((error) => res.status(500).json({message:errors.global.queryError}));

    // if (newEmail && !isEmail && idaccount && email) {
    //     db.getConnection((err, connection) => {
    //         connection.query("UPDATE account SET email=? WHERE idaccount=?", [newEmail, idaccount], (error, results) => {
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

    if (!newEmail || isEmail || !idaccount || !email) return res.status(400).json({message:errors.global.dataError});
    let {error} = await supabase.from('account').update({newEmail}).eq('idaccount', idaccount);
    if (error) return res.status(500).json({message:errors.global.queryError});
    return res.status(200).json({});
});

module.exports = router;