const feathers = require('feathers/client');
const rest = require('feathers-rest/client');
const hooks = require('feathers-hooks');
const authentication = require('feathers-authentication/client');
const request = require('superagent');

module.exports = function () { // eslint-disable-line func-names
  const app = this;
  const client = feathers()
    .configure(hooks())
    .configure(rest(`${app.get('host')}:${app.get('port')}`).superagent(request))
    .configure(authentication());

  app.get('/', (req, res) => {
    res.render('index', {});
  });
  // Login Routing for an old user
  app.get('/login', (req, res) => {
    const query = req.query;
    res.render('login', {
      redirect_uri: query.redirect_uri,
      info: req.session.loginInfoMessage,
      error: req.session.loginErrorMessage,
    });
  });
  app.post('/login', (req, res) => {
    const input = req.body;
    if (!input.email && !input.password) {
      req.session.loginErrorMessage = // eslint-disable-line no-param-reassign
        'Please fill both username & password.';
      res.redirect(`/login?redirect_uri=${input.redirect_uri}`);
    } else {
      client.authenticate({
        type: 'local',
        email: input.email,
        password: input.password,
      })
      .then(result => {
        console.log('Successfully logging in:', result);
        req.session.user = result.data; // eslint-disable-line no-param-reassign
        res.redirect(
          `${input.redirect_uri}?` +
          `_id=${result.data._id}` + // eslint-disable-line no-underscore-dangle
          `&access_token=${result.token}`);
      })
      .catch(err => {
        // redirect to login with flash message
        if (err) {
          req.session.loginErrorMessage = 'Invalid Login'; // eslint-disable-line no-param-reassign
        }
        res.redirect(`/login?redirect_uri=${input.redirect_uri}`);
      });
    }
  });
  // signup routing for a new user
  app.get('/signup', (req, res) => {
    const query = req.query;
    res.render('signup', {
      redirect_uri: query.redirect_uri,
      error: req.session.signupErrorMessage,
    });
  });
  app.post('/signup', (req, res) => {
    const input = req.body;
    if (!input.name && !input.email && !input.password) {
      req.session.signupErrorMessage = // eslint-disable-line no-param-reassign
        '*Please fill all information.';
      res.redirect(`/signup?redirect_uri=${input.redirect_uri}`);
    } else {
      app.service('users')
        .create({
          name: input.name,
          email: input.email,
          password: input.password,
          role: 'user',
        })
        .then(result => {
          console.log('Successfully signing up user:', result);
          req.session.loginInfoMessage = // eslint-disable-line no-param-reassign
            'You have successful signed up! Please log in.';
          res.redirect(`/login?redirect_uri=${input.redirect_uri}`);
        })
        .catch(err => {
          if (err && err.code === 409) {
            req.session.signupErrorMessage = // eslint-disable-line no-param-reassign
              '*It seems you already have YouPin account. ' +
              'Please log in using your email and password.';
          }
          res.redirect(`/signup?redirect_uri=${input.redirect_uri}`);
        });
    }
  });
};
