const express = require('express');
const changeUsername = require('./change-username');
const changeEmail = require('./change-email');
const changePassword = require('./change-password');
const router = express.Router();

router.use(express.json());
router.use('/changeUsername', changeUsername);
router.use('/changeEmail', changeEmail);
router.use('/changePassword', changePassword);

module.exports = router;