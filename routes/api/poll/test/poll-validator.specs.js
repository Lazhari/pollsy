'use strict';

const should = require('should');
const Poll = require('../../../../models/poll');
const PollValidator = require('../lib/poll-validator');

var poll = {
    title: 'test',
    description: 'Test',
    type: 'single',
    choices: []
};

describe('Poll validator module', function() {

    it('should throw an error', function(done) {
        PollValidator.validatePoll({body: poll})
        .then((poll) => {
            should.equal(null);
        })
        .catch((err) => {
            should.exist(err);
            done();
        });
    });

    it('should throw Error title', function(done) {
        poll.choices.push({
            image: ''
        });
        PollValidator.validatePoll({body: poll})
        .then((poll) => {
            should.equal(null);
        })
        .catch((err) => {
            should.exist(err);
            done();
        });
    });
    it('should throw Error for one choice', function(done) {
        poll.choices.push({
            title: 'test',
            image: ''
        });
        PollValidator.validatePoll({body: poll})
        .then((poll) => {
            should.equal(null);
        })
        .catch((err) => {
            let error = new Error('Title on choices should have a title');
            should.equl(error);
            done();
        });
    });
});
