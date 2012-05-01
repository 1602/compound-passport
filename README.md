## About

PassportJS auth library integrated into RailwayJS. Why this package needed? To be honest, PassportJS is dead-simple in integrating. But it can be simplier. This package for authentication without extra coding, just configure it and use

## Setup project

### 1. config/environment.js:

```javascript
var rwps = require('railway-passport');

app.configure(function () {
    // some common stuff (methodOverride, cookie and body parser, session)

    // init passport
    rwps.init();
    // hook up user model
    process.nextTick(function () {
        rwps.loadUser(User);
    });
    app.use(app.router);
});
```

Please not that order of middlewares is important! `rwps.init();` should go right before app.router middleware.

### 2. config/passport.yml

```yaml
development:
  baseURL: 'http://localhost:3000/'
  google: yes
  github:
    clientID: "a8578b8dc47834908338"
    secret: "d8107d7cd75fc8ee1f12cf1f38b3aa065c3ec2ac"
  linkedin:
    apiKey: "3s708f1uys4x"
    secret: "p3iBqlybJ5WNTINv"
production:
  baseURL: 'http://node-js.ru/'
  github:
    clientID: "...."
    secret: "...."
```

## Use

All authentication routes starts with `/auth/PROVIDERNAME`
Just visit `/auth/google` to sign in with google:

    <% link_to('Sign in with google', '/auth/google') %>
    <% link_to('Sign in with linkedin', '/auth/linkedin') %>
    <% link_to('Sign in with github', '/auth/github') %>

Callback urls:

- github: `/auth/github/callback`
- linkedin: `/auth/linkedin/callback`

Example before filter (describe in your application controller):

```javascript
before(function requireManager() {
    if (!session.passport.user) {
        req.session.redirect = req.path;
        redirect('/auth/linkedin');
    } else {
        User.find(session.passport.user, function (err, user) {
            if (user && user.email === 'my.email@somehost.tld') {
                req.user = user;
                next();
            } else {
                flash('error', 'You have no permission to access this area');
                redirect('/');
            }
        });
    }
});
```
