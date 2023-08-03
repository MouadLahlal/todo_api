const express = require('express');
const validateToken = require('../../middleware/validate-token');
const db = require('../../db');
const router = express.Router();
const errors = require('../../utils/errors');

const listExist = (idaccount, name) => {
    return new Promise((resolve, reject) => {
        db.getConnection((err, connection) => {
            if (err) reject({statusCode:500, message:errors.global.connError});
            connection.query("SELECT * FROM lists WHERE idaccount=? AND name=?", [idaccount, name], (error, results) => {
                if (error) reject({statusCode:500, message:errors.global.queryError});
                results.length > 0 ? resolve(true) : resolve(false);
            });
        });
    });
}

router.use(express.json());
router.put('/:oldname', validateToken, async (req, res) => {
    var [ oldname, newname ] = [ req.params.oldname, req.body.newname ];
    var idaccount = req.account;
    var oldListExists = await listExist(idaccount, oldname);
    var newListExists = await listExist(idaccount, newname);

    if (idaccount && oldname && newname && oldListExists === true && newListExists === false) {
        db.getConnection(async (err, connection) => {
            connection.query("UPDATE tasks SET list=? WHERE idaccount=? AND list=?", [newname, idaccount, oldname], (error, results) => {
                if (error) {
                    console.log(error);
                    res.status(500).json({message:errors.global.queryError});
                } else {
                    connection.query("UPDATE lists SET name = ? WHERE idaccount = ? AND name = ?", [newname, idaccount, oldname], (error, results, fields) => {
                        connection.release();
                        if (error) {
                            console.log(error);
                            // res.json({status:false, message:"An error occured while modifying the list, please try again later"});
                            res.status(500).json({message:errors.global.queryError});
                        } else {
                            // res.json({status:true, message:"List modified correctly"});
                            res.status(200).json({});
                        }
                    });
                }
            });
        });
    } else {
        // res.json({status:false, message:"Please enter all data correctly"});
        res.status(400).json({message:errors.global.dataError});
    }
});

module.exports = router;