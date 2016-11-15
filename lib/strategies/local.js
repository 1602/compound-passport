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
    localConf = conf.local;
    passport.use(new Strategy({
        usernameField: conf.usernameField || 'email'
    }, exports.callback));

    authConf = {
        session: true,              // Save login state in session, defaults to _true_
        successRedirect: null,      // After successful login, redirect to given URL
        successMessage: null,       // True to store success message in
                                    // req.session.messages, or a string to use as override
                                    // message for success.
        successFlash: null,         // True to flash success messages or a string to use as a flash
                                    // message for success (overrides any from the strategy itself).
        failureRedirect: '/login',  // After failed login, redirect to given URL
        failureMessage: null,       // True to store failure message in
                                    // req.session.messages, or a string to use as override
                                    // message for failure.
        failureFlash: null,         // True to flash failure messages or a string to use as a flash
                                    // message for failures (overrides any from the strategy itself).
        assignProperty: null        // Assign the object provided by the verify callback to given property
    };

    for (var name in authConf) {
        if (typeof localConf[name] !== 'undefined') {
            authConf[name] = localConf[name];
        }
    }

    app.post('/login', passport.authenticate('local', authConf), exports.redirectOnSuccess);

};
