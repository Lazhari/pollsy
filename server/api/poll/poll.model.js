'use strict';

var mongoose = require('bluebird').promisifyAll(require('mongoose'));

var PollSchema = new mongoose.Schema({
    title: String,
    description: String,
    type: {
        type: String,
        enum: ['single', 'multiple', 'satisfaction']
    },
    choices: [],
    active: Boolean,
    owner: {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    },
    public: {
        type: Boolean,
        default: false
    },
    created: {
        type: Date,
        default: Date.now
    },
    updated: {
        type: Date
    },
    token: {
        type: String,
        unique: true
    },
    deleted: {
        type: Boolean,
        default: false
    }
});

export default mongoose.model('Poll', PollSchema);
