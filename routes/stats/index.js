const express = require('express');
const { supabase } = require('../../db');
const jwt = require('jsonwebtoken');
const validateToken = require('../../middleware/validate-token');
const errors = require('../../utils/errors');

const router = express.Router();

router.use(express.json());

const getTotalTasks = (idaccount) => {
    return new Promise(async (resolve, reject) => {
        // connection.query("SELECT * FROM tasks WHERE idaccount=?", [idaccount], (error, results) => {
        //     if (error) {
        //         reject();
        //     } else {
        //         resolve(results.length);
        //     }
        // });

        let {data, error} = await supabase.from('tasks').select('*').eq('idaccount', idaccount);
        if (error) reject();
        resolve(data.length);
    });
}

const getTodaysTasks = (idaccount) => {
    return new Promise(async (resolve, reject) => {
        // let temp = new Date();
        // let today = `${temp.getFullYear()}-${temp.getMonth()+1}-${temp.getDate()}`;
        // connection.query("SELECT * FROM tasks WHERE idaccount=? AND expiration=?", [idaccount, today], (error, results) => {
        //     if (error) {
        //         reject();
        //     } else {
        //         resolve(results.length);
        //     }
        // });

        let today = new Date().toLocaleDateString('it-IT');
        let {data, error} = await supabase.from('tasks').select('*').eq('idaccount', idaccount).eq('expiration', today);
        if (error) reject();
        resolve(data.length);
    });
}

const getTodaysCompTasks = (idaccount) => {
    return new Promise(async (resolve, reject) => {
        // let temp = new Date();
        // let today = `${temp.getFullYear()}-${temp.getMonth()+1}-${temp.getDate()}`;
        // connection.query("SELECT * FROM tasks WHERE idaccount=? AND completedon=?", [idaccount, today], (error, results) => {
        //     if (error) {
        //         reject();
        //     } else {
        //         resolve(results.length);
        //     }
        // });

        let today = new Date().toLocaleDateString('it-IT');
        let {data, error} = await supabase.from('tasks').select('*').eq('idaccount', idaccount).eq('completedon', today);
        if (error) reject();
        resolve(data.length);
    });
}

router.get('/getProgress', validateToken, async (req, res) => {
    var idaccount = req.account;

    // if (idaccount) {
    //     db.getConnection(async (err, connection) => {
    //         connection.query("SELECT * FROM tasks WHERE idaccount=?" , [idaccount], async (error, results) => {
    //             if (error) {
    //                 res.status(500).json({message:errors.global.queryError});
    //                 // res.json({status:false, message:"An error occured while executing a query, please try again later"});
    //                 connection.release();
    //             } else {
    //                 let nTasks = results.length;
    //                 connection.query("SELECT * FROM tasks WHERE idaccount=? AND done=1", [idaccount], async (error, results) => {
    //                     connection.release();
    //                     if (error) {
    //                         res.status(500).json({message:errors.global.queryError});
    //                         // res.json({status:false, message:"An error occured while executing a query, please try again later"});
    //                     } else {
    //                         // res.json({status:true, message:"Action perfomed correctly", progress:(nTasks === 0 ? 0 : results.length/nTasks), totTasks:nTasks, compTasks:results.length});
    //                         let progress = nTasks === 0 ? 0 : results.length/nTasks;
    //                         res.status(200).json({progress:progress, totTasks:nTasks, compTasks:results.length});
    //                     }
    //                 });
    //             }
    //         });
    //     });
    // } else {
    //     // res.json({status:false, message:"There was an error checking your account"});
    //     res.status(400).json({message:errors.global.dataError});
    // }
    
    let {data, error} = await supabase.from('tasks').select('*').eq('idaccount', idaccount);
    if (error) return res.status(500).json({message:errors.global.queryError});
    let nTasks = data.length;
    ({data, error} = await supabase.from('tasks').select('*').eq('idaccount', idaccount).eq('done', true));
    if (error) return res.status(500).json({message:errors.global.queryError});
    let progress = nTasks === 0 ? 0 : data.length/nTasks;
    return res.status(200).json({progress:progress, totTasks:nTasks, compTasks:data.length});
});

router.get('/getStatistic', validateToken, async (req, res) => {
    var idaccount = req.account;

    // if (idaccount) {
    //     db.getConnection(async (err, connection) => {
    //         connection.query("SELECT * FROM tasks WHERE idaccount=? AND done=?", [idaccount, 1], async (error, results) => {
    //             if (error) {
    //                 // res.json({status:false, message:"An error occured while creating the statistics"});
    //                 res.status(500).json({message:errors.global.queryError});
    //             } else {
    //                 let totTasks = await getTotalTasks(connection, idaccount);
    //                 let todTasks = await getTodaysTasks(connection, idaccount);
    //                 let todCompTasks = await getTodaysCompTasks(connection, idaccount);
    //                 // res.json({status:false, message:"Action perfomed correctly", totTasks, todTasks, todCompTasks});
    //                 res.status(200).json({totTasks, todTasks, todCompTasks});
    //             }
    //         });
    //     });
    // } else {
    //     // res.json({status:false, message:"There was an error checking your account"});
    //     res.status(400).json({message:errors.global.dataError});
    // }

    // let {data, error} = await supabase.from('tasks').select('*').eq('idaccount', idaccount).eq('done', true);
    // if (error) return res.status(500).json({message:errors.global.queryError});
    let totTasks = await getTotalTasks(idaccount);
    let todTasks = await getTodaysTasks(idaccount);
    let todCompTasks = await getTodaysCompTasks(idaccount);
    return res.status(200).json({totTasks, todTasks, todCompTasks});
});

module.exports = router;