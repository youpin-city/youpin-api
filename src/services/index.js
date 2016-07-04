'use strict';
const tempuser = require('./tempuser');
const photo = require('./photo');
const pin = require('./pin');
const authentication = require('./authentication');
const user = require('./user');

module.exports = function() {
  const app = this;

  app.configure(authentication);
  app.configure(user);
  app.configure(pin);
  app.configure(photo);
  app.configure(tempuser);
};
