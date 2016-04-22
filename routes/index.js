/**
* Main application routes
*/

'use strict';

const errors = require('./components/errors');

module.exports = function(app) {

    app.use('', require('./statics'));
    app.use('/api/users', require('./api/user'));
    app.use('/api/polls', require('./api/poll'));
    app.use('/auth', require('./core/auth'));
};
