'use strict';

// Set default node environment to development
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const nunjucks = require('nunjucks');
const mongoose = require('mongoose');
const config = require('./config');
const i18n = require('./i18n');

const app = express();

// Connect to database
mongoose.connect(config.mongo.uri);

// view engine setup
nunjucks.configure(path.join(__dirname, 'views'), {
    autoescape: false,
    express: app,
    watch: true
});

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));

// TODO : Remove in constumize in production ENV
app.use(cookieParser());
app.use(i18n);
app.use(express.static(path.join(__dirname, 'public')));
app.use('/doc', express.static(path.join(__dirname, 'specs-doc')));

// Routing Systems
require('./routes')(app);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use('/:url(api|auth)/*',function(err, req, res, next) {
        res.status(err.status || 500);
        res.send(err);
    });
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error.html', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use('/:url(api|auth)/*',function(err, req, res, next) {
    res.status(err.status || 500);
    res.send(err);
});
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error.html', {
        message: err.message,
        error: ""
    });
});


module.exports = app;
