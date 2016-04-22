'use strict';

const i18n = require('i18n');
const config = require('./config');
const path = require('path');
i18n.configure({
    // setup some locales - other locales default to en silently
    locales:['en', 'fr'],

    // where to store json files - defaults to './locales' relative to modules directory
    directory: path.join(config.root, '/locales'),
    defaultLocale: 'en',

    // sets a custom cookie name to parse locale settings from  - defaults to NULL
    cookie: 'lang',
});

module.exports = (req, res, next) => {

    i18n.init(req, res);
    //res.local('__', res.__);

    const current_locale = i18n.getLocale();

    return next();
};
