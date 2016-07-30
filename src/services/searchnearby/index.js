'use strict';

const hooks = require('./hooks');

const Promise = require('bluebird');
const errors = require('feathers-errors');
const Pin = require('../pin/pin-model.js');

class Service {
  constructor(options) {
    this.options = options || {};
  }

  /**
   * @api {get} /searchnearby Search nearby
   * @apiDescription Get a list of pins within a circle area
   * @apiVersion 0.1.0
   * @apiName GetSearchNearby
   * @apiGroup Pin
   *
   * @apiExample Example usage:
   * curl -i https://api.youpin.city/searchnearby?$center=[13.730537954909,100.56983580503]&$radius=1000&limit=10
   *
   * @apiParam {Number[]} center Center of an area to search in [lat, long] format (Note: prepended by a dollar sign).
   * @apiParam {Number} radius Circle radius to search around the center point (Note: prepended by a dollar sign).
   * @apiParam {Number} limit Limit of a number of result pins
   *
   * @apiSuccess {Number} limit Limit of a number of result pins
   * @apiSuccess {Object[]} data An array of found pins within area specified
   *
   * @apiSuccessExample Success Response:
   *    HTTP/1.1 200 OK
   *    {
   *      limit: 10,
   *      data: [
   *        {
   *          _id: '579b8c113dd2dec509318c47',
   *          detail: 'Dolore dolor tempora magni officiis nisi. Fuga qui cum sint temporibus quos quo repudiandae. Sit rerum et quis vitae. Sapiente architecto totam maiores dolor.',
   *          owner: '579334c75563625d6281b6f1',
   *          provider: '579334c75563625d6281b6f1',
   *          __v: 0,
   *          videos: [],
   *          voters: [],
   *          comments: [],
   *          tags: [],
   *          location: [Object],
   *          photos: [],
   *          neighborhood: [],
   *          mentions: [],
   *          followers: [],
   *          updated_time: '2016-07-29T17:02:09.265Z',
   *          created_time: '2016-07-29T17:02:09.265Z',
   *          categories: []
   *        },
   *        {
   *          _id: '979b8c1131d2de4509118c47',
   *          detail: 'Dolore dolor tempora magni officiis nisi. Fuga qui cum sint temporibus quos quo repudiandae. Sit rerum et quis vitae. Sapiente architecto totam maiores dolor.',
   *          owner: '579334c75563625d6281b6f1',
   *          provider: '579334c75563625d6281b6f1',
   *          __v: 0,
   *          videos: [],
   *          voters: [],
   *          comments: [],
   *          tags: [],
   *          location: [Object],
   *          photos: [],
   *          neighborhood: [],
   *          mentions: [],
   *          followers: [],
   *          updated_time: '2016-06-22T13:12:49.265Z',
   *          created_time: '2016-06-22T13:12:49.265Z',
   *          categories: []
   *        }
   *      ]
   *    }
   *
   * @apiError BadRequest Do not specify $center param.
   *
   * @apiErrorExample Error Response
   *     HTTP/1.1 400 Bad Request
   *     {
   *       "name":"BadRequest",
   *       "message":"Please assign the value to $center.",
   *       "code":400,
   *       "className":"bad-request",
   *       "errors":{}
   *     }
   */
  find(params) {
    if (!params.query.$center) {
      return Promise.resolve(
          new errors.BadRequest('Please assign the value to $center.'));
    }
    // Default limit: 10
    const limit = params.query.limit || 10;
    // Default maxDistance: 1 km
    const maxDistance = (params.query.$radius || 1000);
    // TODO(A): Check if string is correct array format, if not, return meaningful error.
    var coordinate = JSON.parse(params.query.$center);
    // We get [lat, long] but mongo need [long, lat]. So, swap them.
    coordinate = [coordinate[1], coordinate[0]];
    return Pin.find({
      location: {
        $near: {
          $geometry : {
            type : 'Point',
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
