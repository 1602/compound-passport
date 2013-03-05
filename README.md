## About

PassportJS auth library integrated into CompoundJS. Why this package needed? To be honest, PassportJS is dead-simple in integrating. But it can be simplier. This package for authentication without extra coding, just configure it and use

## Setup project

```yaml
development:
  baseURL: 'http://localhost:3000/'
  google: true
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

Add module to config/autoload.js:

```javascript
module.exports = function() {
    return [require('compound-passport')];
};
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

## MIT License

```text
Copyright (C) 2012 by Anatoliy Chakkaev

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
```
