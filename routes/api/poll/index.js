'use strict'

const router = require('express').Router();
const validate = require('express-validation');
const controller = require('./poll.controller.js');
const pollValidation = require('../../validations/polls.js');
const auth = require('../../core/auth/auth.service.js');

router
    .get('/', auth.isAuthenticated(), controller.getAll)
    .get('/:id', controller.get)
    .post('/', auth.isAuthenticated(), validate(pollValidation.create), controller.create)
    .put('/:id', auth.isAuthenticated(), validate(pollValidation.update), controller.update)
    .delete('/:id', auth.isAuthenticated(), controller.delete);
module.exports = router;
