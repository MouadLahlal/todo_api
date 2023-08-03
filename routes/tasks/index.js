const express = require('express');
const addTask = require('./add-task');
const editTask = require('./edit-task');
const deleteTask = require('./delete-task');
const doneTask = require('./done-task');
const undoneTask = require('./undone-task');

const router = express.Router();

router.use(express.json());
router.use('/add', addTask);
router.use('/edit', editTask);
router.use('/delete', deleteTask);
router.use('/done', doneTask);
router.use('/undone', undoneTask);

module.exports = router;