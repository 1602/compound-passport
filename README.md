## About

[PassportJS](http://passportjs.org) auth library integrated into CompoundJS. This package allows authentication without any extra coding - just configure and use.

## Setup
**Step 1:** Install dependencies

Add `compound-passport`, `passport`, and any providers used to your `package.json` and run `npm install`. Remember to add the used Passport Strategies to your `package.json`, e.g. `passport-facebook`, `passport-github`, etc. -- see [PassportJS providers](http://passportjs.org/guide/providers/).

**Step 2:** Configure

Put the following configuration in ```config/passport.yml```.
```yaml
development:
  baseURL: 'http://localhost:3000/'
  local: true
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

To separate configuration from code simply use "process.env" directly in the configuration file:

```yaml
development:
  baseURL: 'http://localhost:3000/'
  local: true
  google: true
  github:
    clientId: "process.env.GITHUB_API_KEY"
    secret: "process.env.GITHUB_API_SECRET"
  linkedin:
    apiKey: "process.env.LINKEDIN_API_KEY"
    secret: "process.env.LINKEDIN_API_SECRET"
production:
  baseURL: 'http://node-js.ru/'
  github:
    clientID: "...."
    secret: "...."
```

The module will then automatically read environment variables and use those.

**Step 3:** Add module

Add module to ```config/autoload.js```:

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

- GitHub: `/auth/github/callback`
- LinkedIn: `/auth/linkedin/callback`

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
Copyright (C) 2012 by Anatoliy Chakkaev <mail@anatoliy.in>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:
```

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

```text
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
```
