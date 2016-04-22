'use strict';

const Poll = require('../../../../models/poll');

let PollQueries = (function() {

    let _getAllPolls = (options, cb) => {
        cb = cb || function(){};
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
                    if(err) {
                        reject(err);
                        return cb(err);
                    }
                    resolve(polls);
                    return cb(null, polls);
                });
        });
    };

    return {
        getPolls : _getAllPolls
    };
})();


module.exports = PollQueries;
