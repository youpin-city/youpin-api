'use strict';

const hooks = require('./hooks');

const Promise = require('bluebird');
const errors = require('feathers-errors');
const Pin = require('../pin/pin-model.js');

class Service {
  constructor(options) {
    this.options = options || {};
  }

  find(params) {
    if (!params.query['$center']) {
      return Promise.resolve(
          new errors.BadRequest('Please assign the value to $center.'));
    }
    // Default limit: 10
    const limit = params.query.limit || 10;
    // Default maxDistance: 1 km
    const maxDistance = (params.query['$radius'] || 1000);
    console.log('Do GeoSearch');
    // TODO(A): Check if string is correct array format, if not, return meaningful error.
    const coordinate = JSON.parse(params.query['$center']);
    console.log('Start finding pins around', coordinate, 'within ' + params.query['$radius'] + ' km.');
    return Pin.find({
      location: {
        $near: {
          $geometry : {
            type : "Point",
            coordinates : coordinate
          },
          $maxDistance: maxDistance
        }
      }
    }).limit(limit).exec()
    .then(function(results) {
      // TODO(A): Add total and pagination
      console.log('Found ' + results.length + ' pins.');
      return Promise.resolve({
        limit: limit,
        data: results
      });
    })
    .catch(function(err) {
      return Promise.resolve(new errors.GeneralError(err));
    });
  }
}

module.exports = function(){
  const app = this;

  // Initialize our service with any options it requires
  app.use('/searchnearby', new Service());

  // Get our initialize service to that we can bind hooks
  const searchnearbyService = app.service('/searchnearby');

  // Set up our before hooks
  searchnearbyService.before(hooks.before);

  // Set up our after hooks
  searchnearbyService.after(hooks.after);
};

module.exports.Service = Service;
