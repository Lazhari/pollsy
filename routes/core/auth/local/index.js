'use strict';

var express = require('express');
var passport = require('passport');
var auth = require('../auth.service');
var Accounts = require('../../../api/user/lib/account-utility');
var mailAuth = require('../../../core/mailing-service').mailAuth;
var router = express.Router();
/**
* @api {post} /auth/local Local Authentication
* @apiName LocalAuthentication
* @apiGroup Authentication
*
* @apiParam {String} email the user mail.
* @apiParam {String} password the user password.
*
* @apiSuccess {String} message the authentication token.
*/
router.post('/', function(req, res, next) {
    passport.authenticate('local', function (err, user, info) {
        var error = err || info;
        if (error) return res.json(401, error);
        if (!user) return res.json(404, {message: 'Something went wrong, please try again.'});

        var token = auth.signToken(user._id, user.role);
        res.json({token: token});
    })(req, res, next);
});

/**
* @api {get} /auth/local/activate-account Activate the user account
* @apiVersion 0.1.0
* @apiPermission owner
* @apiName ActivateUserAccount
* @apiGroup Authentication
* @apiDescription Redirection to login page.
* @apiParam {String} token The user token.
* @apiError TokenUsed The token is already used.
* @apiError BadRequest invalid token.
* @apiError Unauthorized The token not found.
* @apiSampleRequest http://localhost:9090/auth/local/activate-account?token=a6fd7a7f7a2c9ab1f20a9e57acd25596c274ce97829a7d0d54f93dc83bb5a1f4e5beb29540c153ce25c3fdf12abae789
* @apiErrorExample Unauthorized:
*    Error 401: Unauthorized
*    {
*        "message": "Token not found !"
*    }
* @apiErrorExample TokenUsed:
*    HTTP/1.1 Error 401: Unauthorized
*    {
*        "message": "ce token est deja utilise!"
*    }
* @apiErrorExample BadRequest:
*    HTTP/1.1 Error 400: Bad Request
*    [
*        {
*            "param": "token",
*            "msg": "Token invalid"
*        }
*    ]
*/
router.get('/activate-account',function(req, res, next) {
    Accounts.checkToken(req.query.token, function(err, user) {
        if(err) {
            return res.send({message: err.message}, 401);
        } else {
            var data = {
                user : user,
                mailDate: require('moment')().format("Do MMMM YYYY")
            };
            mailAuth.welcomeMail(user.email, data, function(err, infos) {
                if(err) console.error(err);
                // TODO : redirect to success token page
                res.render('front-end/welcome.html');
            });
        }
    });
});

module.exports = router;
