const bodyParser = require('body-parser');
const compress = require('compression');
const configuration = require('feathers-configuration');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const favicon = require('serve-favicon');
const feathers = require('feathers');
const hooks = require('feathers-hooks');
const path = require('path');
const rest = require('feathers-rest');
const serveStatic = require('feathers').static;
const session = require('express-session');
const socketio = require('feathers-socketio');

const init = require('./init');
const middleware = require('./middleware');

init();

const app = feathers();

app.configure(configuration(path.join(__dirname, '..')));

const views = require('./views');
const services = require('./services');

app.use(compress())
  .options('*', cors())
  .enable('strict routing')
  .use(cors())
  .use(favicon(path.join(app.get('public'), 'favicon.ico')))
  .set('views', './src/views')
  .set('view engine', 'pug')
  .use('/static', serveStatic(app.get('public')))
  // set bodyParser to not strict so that API can recieve bare url string
  .use(bodyParser.json({ strict: false }))
  .use(bodyParser.urlencoded({ extended: true }))
  .use(cookieParser())
  .use(session({
    secret: 'sssshhh',
    resave: false,
    saveUninitialized: true,
  }))
  .configure(hooks())
  .configure(rest())
  .configure(socketio())
  // set X-YOUPIN-3-APP-KEY for app authentication hook
  .use((req, res, next) => {
    const youpinAppKeyName = 'X-YOUPIN-3-APP-KEY';

    if (req.get(youpinAppKeyName)) {
      req.feathers.youpinAppKey = // eslint-disable-line no-param-reassign
        req.get(youpinAppKeyName);
    }
    next();
  })
  // An endpoint to setting client successRedirect and failureRedirect into config
  // before forwarding to normal facebook login at /auth/facebook
  .use('/auth/facebook/login', (req, res) => {
    const config = app.get('auth');

    if (req.query.successRedirect) {
      config.clientSuccessRedirect = req.query.successRedirect;
    }
    if (req.query.failureRedirect) {
      config.clientFailureRedirect = req.query.failureRedirect;
    }
    app.set('auth', config);
    res.redirect('/auth/facebook');
  })
  .use('/auth/facebook/success', (req, res) => {
    // Facebook site will set jwt in cookie
    const jwt = req.cookies['feathers-jwt'];
    const clientSuccessRedirect = app.get('auth').clientSuccessRedirect;

    if (!clientSuccessRedirect) {
      res.status(400).send({ error: 'No `successRedirect` provided in querystring' });
    } else {
      res.redirect(`${clientSuccessRedirect}?token=${jwt}`);
    }
  })
  .use('/auth/facebook/failure', (req, res) => {
    const clientFailreRedirect = app.get('auth').clientFailureRedirect;

    if (!clientFailreRedirect) {
      res.status(400).send({ error: 'No `failureRedirect` provided in querystring' });
    } else {
      res.redirect(clientFailreRedirect);
    }
  })
  .configure(services)
  .configure(views)
  .configure(middleware);

module.exports = app;
