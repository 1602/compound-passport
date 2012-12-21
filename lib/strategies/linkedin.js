var passport = require('passport');

exports.callback = function(token, tokenSecret, profile, done) {
    exports.User.findOrCreate({
        linkedinId: profile.id,
        profile: profile
    }, function (err, user) {
        return done(err, user);
    });
};

exports.init = function (conf, app) {
    var Strategy = require('passport-linkedin').Strategy;
    passport.use(new Strategy({
        consumerKey: conf.linkedin.apiKey,
        consumerSecret: conf.linkedin.secret,
        callbackURL: conf.baseURL + 'auth/linkedin/callback'
    }, exports.callback));

    app.get('/auth/linkedin',
        passport.authenticate('linkedin'));
    app.get('/auth/linkedin/callback',
        passport.authenticate('linkedin', { failureRedirect: '/' }),
        exports.redirectOnSuccess);

};

