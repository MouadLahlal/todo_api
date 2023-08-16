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
            connection.query("SELECT * FROM lists WHERE idaccount = ?", [idaccount], (error, results) => {
                connection.release();
                if (error) {
                    console.log(error);
                    // res.json({status:false, message:"An error occured while getting lists, please try again later"});
                    res.status(500).json({message:errors.global.queryError});
                } else if (results.length > 0) {
                    // res.json({status:true, message:"Action perfomed correctly", content:results});
                    res.status(200).json({content:results});
                } else {
                    // res.json({status:false, message:"Action performed correctly but no list found"});
                    res.status(404).json({message:errors.lists.noListFound});
                }
            });
        });
    } else {
        // res.json({status:false, message:"no idaccount"});
        res.status(400).json({message:errors.global.dataError});
    }
});

module.exports = router;