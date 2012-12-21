var passport = require('passport');

exports.callback = function(accessToken, refreshToken, profile, done) {
    exports.User.findOrCreate({
        githubId: profile.id,
        profile: profile
    }, function (err, user) {
        return done(err, user);
    });
};

exports.init = function (conf, app) {
    var Strategy = require('passport-github').Strategy;
    passport.use(new Strategy({
        clientID: conf.github.clientID,
        clientSecret: conf.github.secret,
        callbackURL: conf.baseURL + 'auth/github/callback'
    }, exports.callback));

    app.get('/auth/github',
        passport.authenticate('github'));
    app.get('/auth/github/callback',
        passport.authenticate('github', { failureRedirect: '/' }),
        exports.redirectOnSuccess);
};

