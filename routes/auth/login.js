const express = require('express');
const { supabase } = require('../../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const validateToken = require('../../middleware/validate-token');
const errors = require('../../utils/errors');

const router = express.Router();

router.use(express.json());

router.post('/', async (req, res) => {
    var [ username, password ] = [ req.body.username, req.body.password ];

    // if (username && password) {
    //     db.getConnection(async (err, connection) => {
    //         if (err) {
    //             console.log(err);
    //             res.status(500).json({message:errors.global.connError});
    //         }
    //         connection.query("SELECT * FROM account WHERE username = ?", [username], async (error, results) => {
    //             connection.release();
                
    //             if (error) {
    //                 res.status(500).json({message:errors.global.queryError});
    //             } else if (results.length > 0) {
    //                 if(bcrypt.compareSync(password, results[0].password)){
    //                     let accessToken = jwt.sign({idaccount:results[0].idaccount, username}, process.env.SECRET_TOKEN);
    //                     res.status(200).json({accessToken:accessToken, username:username, email:results[0].email});
    //                 } else {
    //                     res.status(404).json({message:errors.auth.loginFail});
    //                 }
    //             } else {
    //                 res.status(400).json({message:errors.auth.loginFail});
    //             }
    //         });
    //     });
    // } else {
    //     res.status(400).json({message:errors.global.dataError});
    // }

    if (!username || !password) return res.status(400).json({message:errors.global.dataError});

    let {data, error} = await supabase.from('account').select('*').eq('username', username);

    if (error) return res.status(500).json({message: errors.global.queryError});
    else if (data.length > 0) {
        bcrypt.compare(password, data[0].password).then((result) => {
            if (result) {
                let accessToken = jwt.sign({idaccount:data[0].idaccount, username}, process.env.SECRET_TOKEN);
                res.status(200).json({accessToken, username, email:data[0].email});
            } else return res.status(404).json({message: errors.auth.loginFail});
        });
    } else return res.status(404).json({message: errors.auth.loginFail});
});

router.post('/checkLogged', validateToken, (req, res) => {

    // ### ATTENZIONE ###
    // Potrebbe essere meglio mandare direttamente un responso con status code 200 perchè
    // anche solo con validateToken() siamo sicuri che il token è corretto
    // quindi non c'è bisogno di verificare anche l'id dell'account

    var idaccount = req.account;

    if (idaccount) {
        db.getConnection(async (err, connection) => {
            if(err)console.log(err);
            connection.query("SELECT * FROM account WHERE idaccount=?", [idaccount], (error, results) => {
                connection.release();
                if (error) {
                    res.json({status:false, message:"There was an errror checking if you're logged, please try again later"});
                } else if (results.length > 0) {
                    res.json({status:true, message:"Your credentials are correct"});
                } else {
                    res.json({status:false, message:"Your credentials are incorrect, please try again"});
                }
            });
        })
    } else {
        res.json({status:false, message:"Please enter all data correctly and try again"});
    }
});

module.exports = router;
