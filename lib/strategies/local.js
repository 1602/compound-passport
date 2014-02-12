var passport = require('passport');

exports.callback = function (email, password, done) { 
    exports.User.findOrCreate({
        email: email,
        password: password
    }, function (err, user) {
        if (err) {
            return done(err);
        }
        if (!user) {
            return done(err, false);
        }
        var len = exports.User.verifyPassword.length;
        if (len === 2) {
            if (!exports.User.verifyPassword(password, user.password)) {
               return done(err, false);
            } else {
               return done(err, user);
            }
        } else if (len === 3) {
            exports.User.verifyPassword(password, user.password, function(err, isMatch) {
               return done(err, !err && isMatch ? user : false);
            });
        } else {
            return done(err, false);
        }
    });
};

exports.init = function (conf, app) {
    var Strategy = require('passport-local').Strategy;
    passport.use(new Strategy({
        usernameField: conf.usernameField || 'email'
    }, exports.callback));

    app.post('/login', passport.authenticate('local', {
        failureRedirect: '/login',
        failureFlash: conf.failureFlash
    }), exports.redirectOnSuccess);

};
