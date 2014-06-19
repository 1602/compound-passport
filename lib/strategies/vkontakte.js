var passport = require('passport');

exports.callback = function(accessToken, refreshToken, profile, done) {
    exports.User.findOrCreate({
        vkontakteId: profile.id,
        profile: profile
    }, function (err, user) {
        return done(err, user);
    });
};

exports.init = function (conf, app) {
    var Strategy = require('passport-vkontakte').Strategy;
    passport.use(new Strategy({
        clientID: conf.vkontakte.clientID,
        clientSecret: conf.vkontakte.secret,
        callbackURL: conf.baseURL + 'auth/vkontakte/callback'
    }, exports.callback));

    app.get('/auth/vkontakte',
        passport.authenticate('vkontakte'));
    app.get('/auth/vkontakte/callback',
        passport.authenticate('vkontakte', { failureRedirect: '/' }),
        exports.redirectOnSuccess);
};
