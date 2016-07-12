'use strict';

const user = require('./user-model');
const hooks = require('./hooks');

const Promise = require('bluebird');
const errors = require('feathers-errors');
const stormpath = require('express-stormpath');
const service = require('feathers-mongoose');

module.exports = function(){
  const app = this;

  let options = {
    Model: user,
    paginate: {
      default: 5,
      max: 25
    }
  };

  // Initialize our service with any options it requires
  app.use('/users', service(options));
  // Get our initialize service to that we can bind hooks
  const userService = app.service('/users');
  // Set up our before hooks
  userService.before(hooks.before);
  // Set up our after hooks
  userService.after(hooks.after);
};
