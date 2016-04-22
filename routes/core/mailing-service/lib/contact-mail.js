'use strict';
const config = require('../../../../config');
const User = require('../../../../models/user');

const nunjucks = require('nunjucks');
const path = require('path');

const moment = require('moment');
moment.locale('fr');

var ContactMail = (function(){
    var sendgrid  = require('sendgrid')(config.sendGridAPI);

    return {
        send: function(senderMail, fullName, content, callback) {
            var data = {
                content : content,
                fullName: fullName,
                email: senderMail,
                contactDate: moment().format("Do MMMM YYYY"),
            };
            var templateMail = nunjucks.render(path.join(config.root, 'views/mails/contact.html'), data);
            sendgrid.send({
                to:       config.admin,
                from:     senderMail,
                subject:  'Contact Pollsy',
                html:     templateMail
            }, function(err, info) {
                return callback(err, info);
            });
        }
    };
})();

module.exports = ContactMail;
