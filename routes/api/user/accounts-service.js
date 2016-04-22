var express = require('express');
var router = express.Router();
var resetPassport = require('./lib/reset-passpord');

router.post('/reset-password', resetPassport.index);
router.post('/user/reset-password', resetPassport.resetUserPassword);

module.exports = router;
