'use strict';

var express = require('express');
var passport = require('passport');
var auth = require('../auth.service');

var router = express.Router();

router
    /**
    * @api {get} /auth/facebook Singup using facebook
    * @apiName FacebookAuthenticationSingup
    * @apiGroup Authentication
    *
    *
    * @apiSuccess {Object} profile the facebook profile.
    */
    .get('/', passport.authenticate('facebook', {
        scope: ['email', 'user_about_me', 'user_birthday', 'user_location','public_profile'],
        failureRedirect: '/',
        session: false
    }))

    /**
    * @api {get} /auth/facebook/callback Singin using facebook
    * @apiName FacebookAuthenticationSignin
    * @apiGroup Authentication
    */

    .get('/callback', passport.authenticate('facebook', {
        failureRedirect: '/',
        session: false
    }), auth.setTokenCookie);

module.exports = router;
