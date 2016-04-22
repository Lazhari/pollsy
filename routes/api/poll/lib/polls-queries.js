'use strict';
const Poll = require('../../../../models/poll');

let PollQueries = (function() {

    let _getAllPolls = (options, cb) => {
        cb = cb || function() {};
        let query = {
            deleted: {
                $ne: true
            },
            $or: [{
                publisher: options.user._id
            }, {
                public: true
            }]
        };
        return new Promise((resolve, reject) => {
            Poll.find(query)
                .select('-deleted -choices.answers')
                .exec((err, polls) => {
                    if (err) {
                        reject(err);
                        return cb(err);
                    }
                    resolve(polls);
                    return cb(null, polls);
                });
        });
    };
    let _getPoll = (options, cb) => {
        cb = cb || function() {};
        let query = {
            _id: options.pollId,
            deleted: {
                $ne: true
            }
        };
        return new Promise((resolve, reject) => {
            Poll.findOne(query)
                .select('-deleted -choices.answers')
                .exec((err, poll) => {
                    if (err) {
                        reject(err);
                        return cb(err);
                    }
                    if (poll) {
                        resolve(poll);
                        return cb(null, poll);
                    } else {
                        var error = new Error('Coudn\'t get the poll');
                        reject(error);
                        return cb(error);
                    }
                });
        });
    };

    let _deletePoll = (options, cb) => {
        cb = cb || function() {};
        let conditions = {
            _id: options.pollId,
            publisher: options.user._id
        };
        let doc = {
            $set: {
                updated: new Date(),
                deleted: true
            }
        };

        return new Promise((resolve, reject) => {
            Poll.update(conditions, doc)
                .exec((err, raw) => {
                    if (err) {
                        reject(err);
                        return cb(err);
                    }
                    resolve(raw);
                    return cb(null, raw);
                });
        });
    };

    return {
        getPolls: _getAllPolls,
        getPoll: _getPoll,
        deletePoll: _deletePoll
    };
})();


module.exports = PollQueries;
