'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PollSchema = new Schema({
    title: String,
    description: String,
    limitAnswers: {
        type: Number,
        default: 0
    },
    public: {
        type: Boolean,
        default: false
    },
    publisher:{type: Schema.Types.ObjectId, ref: 'User'},
    expiredDate: Date,
    startDate: {
        type: Date,
        default: Date.now
    },
    type: {
        type: String,
        enum: ['single', 'multi']
    },
    choices: [{
        title: String,
        description: String,
        image: String,
        answers: [{
            user: {type: Schema.Types.ObjectId, ref: 'User'},
            created: Date,
            ip: String,
            location: []
        }]
    }],
    deleted: {
        type: Boolean,
        default: false
    },
    updated: {
        type: Date,
        default: Date.now
    },
    created: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.module(PollSchema, 'Poll');
