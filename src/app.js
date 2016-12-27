const bodyParser = require('body-parser');
const compress = require('compression');
const configuration = require('feathers-configuration');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const favicon = require('serve-favicon');
const feathers = require('feathers');
const hooks = require('feathers-hooks');
const jwtDecode = require('jwt-decode');
const path = require('path');
const rest = require('feathers-rest');
const serveStatic = require('feathers').static;
const session = require('express-session');
const socketio = require('feathers-socketio');

const init = require('./init');
const middleware = require('./middleware');
const User = require('./services/user/user-model');
const USER = require('./constants/roles').USER;

init();

const app = feathers();

app.configure(configuration(path.join(__dirname, '..')));

const views = require('./views');
const services = require('./services');

const handleFacebookSuccessRedirect = (role, jwt, response) => {
  if (role === USER) {
    response.redirect(`${app.get('auth').userSuccessRedirect}?token=${jwt}`);
  } else {
    response.redirect(`${app.get('auth').staffSuccessRedirect}?token=${jwt}`);
  }
};

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
  .use('/auth/facebook/success', (req, res) => {
    const jwt = req.cookies['feathers-jwt'];

    if (req.cookies.user) {
      handleFacebookSuccessRedirect(req.cookies.user.role, jwt, res);
    } else {
      const payload = jwtDecode(jwt);
      const userId = payload._id; // eslint-disable-line no-underscore-dangle
      User
        .find({ _id: userId })
        .select('role')
        .then(user => {
          handleFacebookSuccessRedirect(user.role, jwt, res);
        });
    }
  })
  .use('/auth/facebook/failure', (req, res) => {
    res.redirect(app.get('auth').userFailureRedirect);
  })
  .configure(services)
  .configure(views)
  .configure(middleware);

module.exports = app;
