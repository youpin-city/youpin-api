const mongoose = require('mongoose');
const Promise = require('bluebird');

// Services
const activityLog = require('./activity-log');
const app3rd = require('./app3rd');
const authentication = require('./authentication');
const department = require('./department');
const organization = require('./organization');
const photo = require('./photo');
const pin = require('./pin');
const pinStateTransition = require('./pin-state-transition');
const searchnearby = require('./searchnearby');
const summary = require('./summary');
const user = require('./user');
const video = require('./video');

module.exports = function () { // eslint-disable-line func-names
  const app = this;

  mongoose.connect(app.get('mongodb'));
  mongoose.Promise = Promise;

  app.configure(activityLog);
  app.configure(app3rd);
  app.configure(authentication);
  app.configure(department);
  app.configure(organization);
  app.configure(photo);
  app.configure(pin);
  app.configure(pinStateTransition); // must place after pin service
  app.configure(searchnearby);
  app.configure(user);
  app.configure(video);
  app.configure(summary);
};
