'use strict';
const Joi = require('joi');
exports.create = {
    options: {
        flatten: true
    },
    body: {
        title: Joi.string().required(),
        type: Joi.string().required()
    }
};
