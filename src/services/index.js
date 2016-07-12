'use strict';
const searchnearby = require('./searchnearby');
const photo = require('./photo');
const pin = require('./pin');
const authentication = require('./authentication');
const user = require('./user');
const mongoose = require('mongoose');
const Promise = require('bluebird');

module.exports = function() {
  const app = this;

  mongoose.connect(app.get('mongodb'));
  mongoose.Promise = Promise;

  app.configure(authentication);
  app.configure(user);
  app.configure(pin);
  app.configure(photo);
  app.configure(searchnearby);
};
