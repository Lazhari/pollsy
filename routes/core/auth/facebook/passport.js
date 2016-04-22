var passport = require('passport');
var FacebookStrategy = require('passport-facebook').Strategy;
exports.setup = function(User, config) {
    passport.use(new FacebookStrategy({
            clientID: config.facebook.clientID,
            clientSecret: config.facebook.clientSecret,
            callbackURL: config.facebook.callbackURL
        },
        function(accessToken, refreshToken, profile, done) {
            console.log(profile);
            User.findOne({
                    'facebook.id': profile.id
                },
                function(err, user) {
                    if (err) {
                        return done(err);
                    }
                    if (!user) {
                        user = new User({
                            fullName: profile.displayName? profile.displayName : '',
                            email: (profile.emails && profile.emails.length) ? profile.emails[0] : '',
                            firstName: profile.name.familyName ?profile.name.givenName: '',
                            lastName: profile.name.givenName ? profile.name.givenName: '',
                            role: 'user',
                            provider: 'facebook',
                            facebook: profile._json
                        });
                        user.save(function(err) {
                            if (err) done(err);
                            return done(err, user);
                        });
                    } else {
                        return done(err, user);
                    }
                });
        }
    ));
};
