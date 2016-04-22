'use strict';
let PollValidator = (function() {
    let _validatePollChoices = (options, cb) => {
        return new Promise((resolve, reject) => {
            options.choices.map((item) => {
                if (!item.title) {
                    var error = new Error('Title on choices should have a title');
                    reject(error);
                    return cb(error);
                }
            });
            resolve(options.choices);
            return cb(null, options.choices);
        });
    };

    let _validatePoll = (options, cb) => {
        let poll = options.body;
        return new Promise((resolve, reject) => {
            if (poll.type !== 'single' && poll.type !== 'multiple') {
                reject(new Error('Unsupporeted poll type'));
                return cb(new Error('Unsupporeted poll type'));
            }
            if (!poll.choices || poll.choices.length < 2) {
                reject(new Error('Choices should be more than one'));
                return cb(new Error('Choices should be more than one'));
            }
            _validatePollChoices({
                    choices: poll.choices
                })
                .then((choices) => {
                    resolve(poll);
                    return cb(null, poll);
                })
                .catch((err) => {
                    reject(err);
                    return cb(err);
                });
        });
    };
    return {
        validatePoll: _validatePoll,
        validatePollChoices: _validatePollChoices
    };
})();


module.exports = PollValidator;
