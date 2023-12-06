const express = require('express');
const getAllLists = require('./get-all-lists');
const getTodayTasks = require('./get-today-tasks');
const getImportantTasks = require('./get-important-tasks');
const getListTasks = require('./get-list-tasks');
const addList = require('./add-list');
const editList = require('./edit-list');
const deleteTaks = require('./delete-list');
const router = express.Router();

router.use(express.json());
router.use('/getAll', getAllLists);
router.use('/getToday', getTodayTasks);
router.use('/getImportant', getImportantTasks);
router.use('/list', getListTasks);
router.use('/add', addList);
router.use('/edit', editList);
router.use('/delete', deleteTaks);

module.exports = router;