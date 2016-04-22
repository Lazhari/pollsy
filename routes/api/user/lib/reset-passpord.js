var User = require('../../../../models/user');
var Token = require('../../../../models/token');
var Mailing = require('../../../core/mailing-service').mailAuth;
var crypto = require('crypto');
var moment = require('moment');
var async = require('async');

var ResetPassword = (function() {
    var _getToken = function(token, cb) {
        Token.findOne({token: token, expired: {$gt: new Date()}}, function(err, token) {
            if(err || !token) return cb(new Error('Token not founded!'));
            return cb(null, token);
        });
    };

    var _activateUser = function(token, cb) {
        User.findById(token.user, function(err, user) {
            if(err) return cb(err);
            if(!user) return cb(new Error('User not founded'));
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
    var _createToken = function(userId, expirationDays, cb) {
        crypto.randomBytes(48, function(ex, buf) {
            var token = new Token({
                user: userId,
                token: buf.toString('hex'),
                created: new Date(),
                expired: moment().add(expirationDays, 'days').toISOString()
            });
            token.save(cb);
        });
    };
    var _checkToken = function(token, cb) {
        _getToken(token, function(err, token) {
            if(err) return cb(err);
            if(token.used) {
                return cb(new Error('This token is already used!'));
            }
            _activateUser(token, function(err, user) {
                if(err) return cb(err);
                return cb(null ,token, user);
            });
        });
    };
    return {
        /**
        * @api {post} /auth/account/reset-password Reset password user
        * @apiVersion 2.1.0
        * @apiPermission none
        * @apiName ResetPassword
        * @apiGroup ResetPassword
        * @apiParam {String} email     The user email.
        * @apiSuccess {Object} response the response object.
        * @apiSuccess {Boolean} response.ok=true The response status OK.
        * @apiSuccess {String} response.message The response message.
        * @apiError {Object} error The error message.
        * @apiError {Boolean} response.ok=false The response status OK.
        * @apiError {String} response.message The response message.
        * @apiSampleRequest http://localhost:9090/auth/account/reset-password
        * @apiSuccessExample Success-Response:
        *     HTTP/1.1 200 OK
        *     {ok:true, message: 'Check your mail to reset your password'}
        * @apiErrorExample ValidationErrors:
        *     HTTP/1.1 200 OK
        *     {ok:false, message: "Error creation token"}
        */
        index: function(req, res, next) {
            req.checkBody('email', 'The email field is invalid').isEmail();
            var errors = req.validationErrors();
            if (errors) {
                return res.status(200).send({ok:false, message: 'The email field is invalid'});
            } else {
                var email = req.body.email;
                User.findOne({email: email}, function(err, user) {
                    if(err) return res.status(200).send({ok: false, message:'User not found!'});
                    if(!user) return res.status(200).send({ok: false, message:'User not found!'});

                    // Generate Token
                    _createToken(user._id, 3, function(err, token) {
                        if(err) return res.status(200).send({ok:false, message: "Error creation token"});
                        if(token) {
                            //sending mail Reset passpword
                            moment.locale('fr');
                            var data = {
                                user: user,
                                token: token.token,
                                mailDate: moment().format("Do MMMM YYYY")
                            };
                            Mailing.resetPassword(email, data, function(err, info) {
                                if(err) console.error('# Error sending mail Reset passpword :', err);
                                console.info('# Sending mail Reset passpword', info);
                            });
                            return res.status(200).send({ok:true, message: 'Vérifiez votre mail pour réinitialiser votre mot de passe!'});
                        }
                    });
                });
            }
        },
        resetPassport: function(req, res) {
            var token = req.query.token;
            return res.render('reset-password.html', {token: token});
        },
        resetUserPassword: function(req, res) {
            req.checkBody('token', 'The token field is invalid').notEmpty();
            req.checkBody('password', 'The password is invalid').isLength(6,16);
            var errors = req.validationErrors();
            if (errors) {
                return res.status(200).send({ok:false, message: "Token ou mot de passe est invalide!"});
            } else {
                var token = {};
                // Activate Account
                _checkToken(req.body.token, function(err, token, user) {
                    if(err) {
                        return res.send({ok:false ,message: err.message}, 200);
                    } else {
                        token = token;
                        user.password = req.body.password;
                        user.save(function(err, user) {
                            if(err) return res.status(200).send({ok:false, maessage:"Désolé, nous ne pouvons pas réinitialiser votre mot de passe, essayez plus tard!"});
                            return res.status(200).send({ok:true, message: "Votre mot de passe a été changé avec succès!"});
                        });
                    }
                });
            }
        }
    };
})();

module.exports = ResetPassword;
