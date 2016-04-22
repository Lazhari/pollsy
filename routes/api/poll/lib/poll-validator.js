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
        let pollBody = options.body;
        return new Promise((resolve, reject) => {
            _validatePoll({
                choices: pollBody.choices
            }).then((choices) => {
                resolve(pollBody);
                return cb(null, pollBody);
            }).catch((err) => {
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
