'use strict';

const mongoose = require('mongoose');
const Promise = require('bluebird');

// Services
const authentication = require('./authentication');
const user = require('./user');
const pin = require('./pin');
const photo = require('./photo');
const video = require('./video');
const searchnearby = require('./searchnearby');
const app3rd = require('./app3rd');

module.exports = function() {
  const app = this;

  mongoose.connect(app.get('mongodb'));
  mongoose.Promise = Promise;

  app.configure(authentication);
  app.configure(user);
  app.configure(pin);
  app.configure(photo);
  app.configure(video);
  app.configure(searchnearby);
  app.configure(app3rd);
};
