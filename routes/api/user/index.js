'use strict';

const express = require('express');
const validate = require('express-validation');

const controller = require('./user.controller');
const auth = require('../../core/auth/auth.service.js');
const userValidation = require('../../validations/users');

var router = express.Router();

router
    .get('/me', auth.isAuthenticated(), controller.me)
    .put('/:id/password', auth.isAuthenticated(), controller.changePassword)
    .put('/profile', auth.isAuthenticated(), controller.updateProfile)
    .get('/:id', controller.show)
    .post('/', validate(userValidation.create), controller.create);

router.post('/avatar',  auth.isAuthenticated(), controller.uploadPicture);
module.exports = router;
