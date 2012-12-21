var passport = require('passport');

exports.callback = function(token, tokenSecret, profile, done) {
    exports.User.findOrCreate({
        twitterId: profile.id,
        profile: profile
    }, function (err, user) {
        return done(err, user);
    });
};

exports.init = function (conf, app) {
    var Strategy = require('passport-twitter').Strategy;
    passport.use(new Strategy({
        consumerKey: conf.twitter.apiKey,
        consumerSecret: conf.twitter.secret,
        callbackURL: conf.baseURL + 'auth/twitter/callback'
    }, exports.callback));

    app.get('/auth/twitter',
        passport.authenticate('twitter'));

    app.get('/auth/twitter/callback',
        passport.authenticate('twitter', {
            failureRedirect: conf.failureRedirect || '/'
        }), exports.redirectOnSuccess);

};
