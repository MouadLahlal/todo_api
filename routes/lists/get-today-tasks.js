const express = require('express');
const validateToken = require('../../middleware/validate-token');
const db = require('../../db');
const router = express.Router();
const errors = require('../../utils/errors');

router.use(express.json());
router.get('/', validateToken, async (req, res) => {
    var idaccount = req.account;
    
    if (idaccount) {
        db.getConnection(async (err, connection) => {
            let temp = new Date();
            let today = `${temp.getFullYear()}-${temp.getMonth()+1}-${temp.getDate()}`;
            connection.query("SELECT * FROM tasks WHERE idaccount=? AND expiration=? and done=?", [idaccount, today, 0], (error, results) => {
                connection.release();
                if (error) {
                    console.log(error);
                    // res.json({status:false, message:"An error occured while getting tasks, please try again later"});
                    res.status(500).json({message:errors.global.queryError});
                } else if (results.length > 0) {
                    // res.json({status:false, message:"Action performed correctly", content:results});
                    res.status(200).json({content:results});
                } else {
                    // res.json({status:false, message:"Action performed successfully but no task found"});
                    res.status(404).json({message:errors.lists.noTaskFound});
                }
            });
        });
    }
});

module.exports = router;