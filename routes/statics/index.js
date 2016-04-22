var express = require('express');
var router = express.Router();

var config = require('../../config/index.js');
var resetPassport = require('../api/user/lib/reset-passpord');
var path = require('path');
var contatMail = require('../core/mailing-service').contatMail;

router.get('/doc', function(req, res, next) {
    res.sendfile(path.join(config.root, 'specs-doc/index.html'));
});

router.get('/', function(req, res, next) {
    res.render('front-end/welcome.html');
});

router.get('/admin', function(req, res, next) {
    res.sendfile('public/apps/admin-app/material.html');
});

router.get('/admin-v2', function(req, res, next) {
    res.sendfile('public/apps/admin-app-v2/index.html');
});

router.post('/contact', function(req, res, next) {
    req.checkBody('fullName', 'Veuillez bien remplir le champs nom complet').notEmpty();
    req.checkBody('email', 'Veuillez bien remplir le champs email').isEmail();
    req.checkBody('content', 'Veuillez bien remplir le champs message').notEmpty();

    var errors = req.validationErrors();
    if(errors) {
        return res.send({ok: false, errors: errors});
    } else {
        var email = req.body.email;
        var fullName = req.body.fullName;
        var content = req.body.content;
        contatMail.send(email, fullName, content, function(err, info) {
            if(err) {
                console.error('Contact mail failed', err);
                return res.send({ok: false, message: 'Nous avons une difficulte technique veuillez réessayer!'});
            }
            console.info('Mail contact', info);
            return res.send({ok: true, message: 'Votre message est bien envoyé, Merci.'});
        });
    }
});

router.get('/reset-password', resetPassport.resetPassport);

module.exports = router;
