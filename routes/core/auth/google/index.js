'use strict';

var express = require('express');
var passport = require('passport');
var auth = require('../auth.service');

var router = express.Router();

router
    /**
    * @api {get} /auth/google Singup using google
    * @apiName GoogleAuthenticationSingup
    * @apiGroup Authentication
    *
    *
    * @apiSuccess {Object} profile the google+ profile.
    */
    .get('/', passport.authenticate('google', {
        failureRedirect: '/#/login',
        scope: [
            'https://www.googleapis.com/auth/userinfo.profile',
            'https://www.googleapis.com/auth/userinfo.email'
        ],
        session: false
    }))
    /**
    * @api {get} /auth/google/callback Singin using google
    * @apiName GoogleAuthenticationSignin
    * @apiGroup Authentication
    */
    .get('/callback', passport.authenticate('google', {
        failureRedirect: '/#/login',
        session: false
    }), auth.setTokenCookie);

module.exports = router;
