var passport = require('passport');
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
exports.setup = function(User, config) {
    passport.use(new GoogleStrategy({
            clientID: config.google.clientID,
            clientSecret: config.google.clientSecret,
            callbackURL: config.google.callbackURL
        },
        function(accessToken, refreshToken, profile, done) {
            User.findOne({
                'google.id': profile.id
            }, function(err, user) {
                if (!user) {
                    User.findOne({email: profile.emails[0].value}, function(err, user) {
                        if(err) return done(err);
                        if(!user) {
                            user = new User({
                                fullName: profile.displayName,
                                firstName: profile.name.familyName,
                                lastName: profile.name.givenName,
                                email: profile.emails[0].value,
                                gender: (profile.gender==='male')? 'Homme':'Femme',
                                avatarPictureUrl: profile._json.image.url.replace('?sz=50',''),
                                role: 'user',
                                provider: 'google',
                                google: profile._json
                            });
                        } else {
                            user.fullName = profile.displayName;
                            user.firstName = profile.name.familyName;
                            user.lastName= profile.name.givenName;
                            user.gender= (profile.gender==='male')? 'Homme':'Femme';
                            user.avatarPictureUrl= profile._json.image.url.replace('?sz=50','');
                            user.role= 'user';
                            user.provider= 'google';
                            user.google= profile._jso;
                        }
                        user.save(function(err) {
                            if (err) return done(err);
                            return done(err, user);
                        });
                    });
                } else {
                    return done(err, user);
                }
            });
        }
    ));
};
