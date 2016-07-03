'use strict';

const path = require('path');
const serveStatic = require('feathers').static;
const favicon = require('serve-favicon');
const compress = require('compression');
const cors = require('cors');
const feathers = require('feathers');
const configuration = require('feathers-configuration');
const hooks = require('feathers-hooks');
const rest = require('feathers-rest');
const bodyParser = require('body-parser');
const socketio = require('feathers-socketio');
const middleware = require('./middleware');
const stormpath = require('express-stormpath');
// firebase
const firebase = require('firebase');
const firebaseConfig = {
  databaseURL: 'https://you-pin.firebaseio.com',
  storageBucket: 'you-pin.appspot.com',
  serviceAccount: './youpin_credentials.json',
};
firebase.initializeApp(firebaseConfig);
// firebase end
const services = require('./services');

const app = feathers();

app.configure(configuration(path.join(__dirname, '..')));

// stormpath init
app.use(stormpath.init(app, {}));
app.on('stormpath.ready', function () {
  console.log('Stormpath Ready!');
});
// stormpath end

app.use(compress())
  .options('*', cors())
  .use(cors())
  .use(favicon( path.join(app.get('public'), 'favicon.ico') ))
  .use('/', serveStatic( app.get('public') ))
  .use(bodyParser.json())
  .use(bodyParser.urlencoded({ extended: true }))
  .configure(hooks())
  .configure(rest())
  .configure(socketio())
  .configure(services)
  .configure(middleware);

module.exports = app;
