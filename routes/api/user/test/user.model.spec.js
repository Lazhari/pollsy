'use strict';

var should = require('should');
var app = require('../../../../app');
var User = require('../../../../models/user');

var user = new User({
    provider: 'local',
    fistName: 'Fake',
    lastName: 'User',
    email: 'test@test.com',
    password: 'password'
});

describe('User Model', function() {
    before(function(done) {
        // Clear users before testing
        User.remove().exec().then(function() {
            done();
        });
    });

    afterEach(function(done) {
        User.remove().exec().then(function() {
            done();
        });
    });

    it('should begin with no users', function(done) {
        User.find({}, function(err, users) {
            users.should.have.length(0);
            done();
        });
    });

    it('should return user first creation', function(done) {
        user.save(function() {
            let newUser = new User(user);
            newUser.save(function(err, user) {
                should.exist(user);
                done();
            });
        });
    });

    it('should fail when saving a duplicate user', function(done) {
        user.save(function() {
            var userDup = new User(user);
            userDup.save(function(err) {
                should.exist(err);
                done();
            });
        });
    });

    it('should fail when saving without an email', function(done) {
        user.email = '';
        user.save(function(err) {
            should.exist(err);
            done();
        });
    });

    it("should authenticate user if password is valid", function() {
        return user.authenticate('password').should.be.true;
    });

    it("should not authenticate user if password is invalid", function() {
        return user.authenticate('blah').should.not.be.true;
    });
});
