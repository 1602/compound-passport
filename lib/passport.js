var Passport = require('passport').Passport;
var yaml = require('yaml-js');
var fs = require('fs');

exports.strategies = [];

exports.redirectOnSuccess = function redirectOnSuccess(req, res) {
    var redir = '/';
    if (req.session.redirect) {
        redir = req.session.redirect;
        delete req.session.redirect;
    }
    res.redirect(redir);
};

var stratDir = __dirname + '/strategies/';
require('fs').readdirSync(stratDir).forEach(function (file) {
    if (file.match(/[^\.].*?\.js$/)) {
        var name = file.replace(/\.js$/, '');
        exports.strategies[name] = require(stratDir + file);
        exports.strategies[name].redirectOnSuccess = exports.redirectOnSuccess;
    }
});


//  Helper regexp and function for reading apiKey/secret from process.env
var processEnvRegexp = /^process\.env\.(\w+)$/;
var evalProcessEnvIfNeeded = function(value) {
    if(!value) {
        return value;
    }

    var results = value.match(processEnvRegexp);
    if(!results
        || results.length != 2) {
        return value;
    }

    return process.env[results[1]];
}

exports.init = function (compound) {
    var app = compound.app;
    var passport = new Passport;

    (function injectRoutes() {

        var gotRouter, i, l = app.stack.length;
        app.stack.forEach(function (r, i) {
            if (r.handle === app.router) {
                gotRouter = i;
            }
        });
        for (i = l; i > gotRouter; i--) {
            app.stack[i + 1] = app.stack[i - 1];
        }
        if (gotRouter) {
            app.stack[gotRouter] = {route: '', handle: passport.initialize()};
            app.stack[gotRouter + 1] = {route: '', handle: passport.session()};
        } else {
            app.use(passport.initialize());
            app.use(passport.session());
            app.use(app.router);
        }
    })();

    var conf = fs.readFileSync(app.root + '/config/passport.yml', 'utf8').toString();
    var conf = yaml.load(conf);
    if (conf && conf instanceof Array) conf = conf[0];
    conf = conf[app.set('env')];
    Object.keys(exports.strategies).forEach(function (str) {
        if (conf[str]) {
            //  If the apiKey and/or secret are defined as process.env.<environment variable> then evaluate them as such.
            conf[str].apiKey = evalProcessEnvIfNeeded(conf[str].apiKey);
            conf[str].secret = evalProcessEnvIfNeeded(conf[str].secret);
            //  Github strategy uses clientID instead of apiKey so instead of introducing a breaking change
            //  we handle the special case.
            if(conf[str].clientID) {
                conf[str].clientID = evalProcessEnvIfNeeded(conf[str].clientID);
            }

            exports.strategies[str].init(conf, app);
        };
    });

    compound.on('models', function(models) {
        if (models.User) {
            exports.loadUser(models.User);
        }
    });

    compound.on('structure', function(s) {
        //  Use __compoundPassportAuth to avoid polluting controllers namespace.
        s.controllers.__compoundPassportAuth = function CompoundPassportAuthController() {
            this.__missingAction = function (c) {
                c.next();
            };
        };
    });

    //  For auth/* routes that aren't enabled leave the application to handle 404.

    // Passport logout (see http://passportjs.org/guide/logout/), gets `logoutURL` from /config/passport.yml
    app.get('/auth/logout', function(req, res) {
        req.logout();
        res.redirect(conf.logoutURL || '/');
    });

    // convert user to userId
    passport.serializeUser(function serializeUser(user, done) {
        done(null, user.id);
    });

    // convert userId to user
    passport.deserializeUser(function deserializeUser(userId, done) {
        exports.User.find(userId, function (err, user) {
            done(err, user);
        });
    });

};

exports.loadUser = function (u) {
    if (!u.findOrCreate) {
        u.findOrCreate = require('./user.js').findOrCreate;
    }
    Object.keys(exports.strategies).forEach(function (str) {
        exports.strategies[str].User = u;
    });
    exports.User = u;
};
