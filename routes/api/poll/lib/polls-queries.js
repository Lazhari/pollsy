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
    let _getSinglePoll = (options, cb) => {
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

    return {
        getPoll: _getSinglePoll,
        getPolls: _getAllPolls
    };
})();


module.exports = PollQueries;
