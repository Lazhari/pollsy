'use strict';

const path = require('path');
const _ = require('lodash');

function requiredProcessEnv(name) {
    if (!process.env[name]) {
        throw new Error('You must set the ' + name + ' environment variable');
    }
    return process.env[name];
}

// All configurations will extend these options
// ============================================
const all = {
    env: process.env.NODE_ENV,

    // Root path of server
    root: path.normalize(__dirname + '/../'),

    // Server port
    port: process.env.PORT || 9000,

    // Should we populate the DB with sample data?
    seedDB: false,

    // Secret for session, you will want to change this and make it an environment variable
    secrets: {
        session: 'my big fucking secret'
    },

    // List of user roles
    userRoles: ['guest', 'user', 'admin'],

    // MongoDB connection options
    mongo: {
        options: {
            db: {
                safe: true
            }
        }
    },
    host: process.env.HOSTNAME || 'http://localhost:9000',

    facebook: {
        clientID: process.env.FACEBOOK_ID || '1656970871216658',
        clientSecret: process.env.FACEBOOK_SECRET || '03d3392e1c6f83c9b747e8434bbb3260',
        callbackURL: (process.env.DOMAIN || '') + '/auth/facebook/callback'
    },

    twitter: {
        clientID: process.env.TWITTER_ID || 'id',
        clientSecret: process.env.TWITTER_SECRET || 'secret',
        callbackURL: (process.env.DOMAIN || '') + '/auth/twitter/callback'
    },

    google: {
        clientID: process.env.GOOGLE_ID || '215221144659-ibou4ribft65stvtbhvcoml9amoqn83g.apps.googleusercontent.com',
        clientSecret: process.env.GOOGLE_SECRET || 'HVodzhAn4FubtCmGfd_lg8sC',
        callbackURL: (process.env.DOMAIN || '') + '/auth/google/callback'
    },
    sendGridAPI: "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",
    admin: 'lazhari.mohammed@outlook.com',
    cloudinary: {
        cloud_name: 'laz',
        api_key: '854557166328839',
        api_secret: '7kqyk9wemvN_iDDy4VAVbDBH7oA'

    }
};

// Export the config object based on the NODE_ENV
// ==============================================
module.exports = _.merge(
    all,
    require('./' + process.env.NODE_ENV + '.js') || {});
