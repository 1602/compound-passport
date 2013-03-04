var passport = require('passport'),
    conf = railway.utils.readYaml(app.root + '/config/passport.yml')[app.set('env')];

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

exports.init = function (compound) {
    var app = compound.app;

    app.use(passport.initialize());
    app.use(passport.session());

    var conf = require(app.root + '/config/passport');
    if (conf && conf instanceof Array) conf = conf[0];
    conf = conf[app.set('env')];
    Object.keys(exports.strategies).forEach(function (str) {
        if (conf[str]) {
            exports.strategies[str].init(conf);
        };
    });
    app.get('/auth/:idp/*', function (req, res) {
        res.send('Provider `' + req.params.idp + '` is not enabled. Specify appropriated settings in config/passport.yml file');
    });
};

exports.loadUser = function (u) {
    if (!u.findOrCreate) {
        u.findOrCreate = require('./user').findOrCreate;
    }
    Object.keys(exports.strategies).forEach(function (str) {
        exports.strategies[str].User = u;
    });
    exports.User = u;
};

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

