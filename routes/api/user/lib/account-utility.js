'use strict';
var crypto = require('crypto');
var Token = require('../../../../models/token');
var User = require('../../../../models/user');
var moment = require('moment');
var Accounts = (function() {
    var _getToken = function(token, cb) {
        Token.findOne({token: token, expired: {$gt: new Date()}}, function(err, token) {
            if(err || !token) return cb(new Error('Token not found !'));
            return cb(null, token);
        });
    };

    var _activateUser = function(token, cb) {
        User.findById(token.user, function(err, user) {
            if(err) return cb(err);
            if(!user) return cb(new Error('user not found'));
            user.active = true;
            user.save(function(err, user) {
                if(err) return cb(err);
                token.used = true;
                token.save(function(err) {
                    if(err) return cb(err);
                    return cb(null, user);
                });
            });
        });
    };

    return {
        createToken: function(userId, expirationDays, cb) {
            crypto.randomBytes(48, function(ex, buf) {
                var token = new Token({
                    user: userId,
                    token: buf.toString('hex'),
                    created: new Date(),
                    expired: moment().add(expirationDays, 'days').toISOString()
                });
                token.save(cb);
            });
        },
        checkToken: function(token, cb) {
            _getToken(token, function(err, token) {
                if(err) return cb(err);
                if(token.used) {
                    return cb(new Error('ce token est deja utilise!'));
                }
                _activateUser(token, function(err, user) {
                    if(err) return cb(err);
                    return cb(null ,user);
                });
            });
        }
    };
})();

module.exports = Accounts;
