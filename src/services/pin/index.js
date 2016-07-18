'use strict';

const pin = require('./pin-model');
const hooks = require('./hooks');
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
   *
   * @apiSuccess {String} owner Pin's owner ID.
   * @apiSuccess {String} detail Pin's detail.
   * @apiSuccess {String} provider Pin's provider ID.
   * @apiSuccess {Object} location Location information
   * @apiSuccess {String} location.type Type of location.
   * @apiSuccess {Number[]} location.coordinates Latitude and longitude of location
   * @apiSuccess {String[]} photos List of photos in this pin.
   * @apiSuccess {String[]} videos List of videos in this pin.
   * @apiSuccess {String[]} comments List of comments for this pin.
   * @apiSuccess {String[]} voters List of user IDs who vote this pin.
   * @apiSuccess {String[]} mentions List of mentions of this pin.
   * @apiSuccess {String[]} followers List of user IDs who follow this pin.
   * @apiSuccess {String[]} neighborhood List of neighborhood of this pin.
   * @apiSuccess {String[]} categories List of categories of this pin.
   * @apiSuccess {String[]} tags List of tags of this pin.
   * @apiSuccess {String} created_time Created time in ISO 8601 format.
   * @apiSuccess {String} updated_time Updated time in ISO 8601 format.
   * @apiSuccessExample Success-Response:
   *    HTTP/1.1 200 OK
   *    {
   *      "owner": "578aede2aac63013598e8501",
   *      "detail": "ถังขยะล้นมาหลายวันแล้ว",
   *      "provider": ,
   *      "location": {
   *        "type": "Point",
   *        "coordinates": [13.756727,100.5018549],
   *      },
   *      "photos": [],
   *      "videos": [],
   *      "comments": [],
   *      "voters": [],
   *      "mentions": [],
   *      "followers": [],
   *      "neighborhood": [],
   *      "categories": [],
   *      "tags": [],
   *      "created_time": "2016-07-17T02:41:56.597Z",
   *      "updated_time": "2016-07-17T02:41:56.597Z"
   *    }
   */
  app.use('/pins', service(options));
  const pinService = app.service('/pins');
  pinService.before(hooks.before);
  pinService.after(hooks.after);
};
