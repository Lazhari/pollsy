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

    it('should throw an error', function() {
        return PollValidator.validatePoll({
            body: poll
        }).should.be.rejected();
    });

    it('should throw Error title', function() {
        poll.choices.push({
            image: ''
        });
        return PollValidator.validatePoll({
            body: poll
        }).should.be.rejected();
    });
    it('should throw Error for one choice', function() {
        poll.choices.push({
            title: 'test',
            image: ''
        });
        return PollValidator.validatePoll({
            body: poll
        }).should.be.rejected();
    });
    it('should return Poll Object', function() {
        poll.choices=[{title: 'test 1'}, {title: 'test2'}];
        return PollValidator.validatePoll({
            body: poll
        }).should.finally.be.exactly(poll);
    });

    it('should throw an error if type is not supported', function() {
        poll.type = 'test';
        return PollValidator.validatePoll({
            body: poll
        }).should.be.rejected();
    });

    it('should throw an error if choice title is empty string', function() {
        poll.choices.push({
            image: ''
        });
        return PollValidator.validatePoll({
            body: poll
        }).should.be.rejected();
    });
});
