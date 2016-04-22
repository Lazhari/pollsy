'use strict';

const Joi = require('joi');

exports.create = {
    options : { flatten : true },
    body: {
        firstName: Joi.string().required(),
        lastName: Joi.string().required(),
        email: Joi.string().email().required(),
        password: Joi.string().regex(/[a-zA-Z0-9]{3,30}/).required()
    }
};
