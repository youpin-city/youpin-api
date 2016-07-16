'use strict';

const pin = require('./pin-model');
const hooks = require('./hooks');

const Promise = require('bluebird');
const errors = require('feathers-errors');
const stormpath = require('express-stormpath');
const service = require('feathers-mongoose');

module.exports = function() {
  const app = this;

  const options = {
    Model: pin,
    paginate: {
      default: 5,
      max: 50
    }
  };
  /**
   * @api {get} /pins/:id Request pin information
   * @apiVersion 0.1.0
   * @apiName GetPin
   * @apiGroup Pin
   *
   * @apiParam {Number} id Pin unique ID.
   */
  app.use('/pins', service(options));
  const pinService = app.service('/pins');
  pinService.before(hooks.before);
  pinService.after(hooks.after);
};
