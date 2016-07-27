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
   * @api {get} /pins/:id Get info
   * @apiVersion 0.1.0
   * @apiName GetPin
   * @apiGroup Pin
   *
   * @apiExample Example usage:
   * curl -i http://api.youpin.city/pins/5798cc78652b2aab35fd663d
   * @apiParam {String} id Pin unique ID.
   *
   * @apiSuccess {String} _id Pin unique ID.
   * @apiSuccess {String} status Pin's status ('verified', 'unverfied', '').
   * @apiSuccess {String} owner Pin's owner ID.
   * @apiSuccess {String} provider Pin's provider ID.
   * @apiSuccess {String} detail Pin's detail.
   * @apiSuccess {String} level Severity level.
   * @apiSuccess {String[]} videos List of videos in this pin.
   * @apiSuccess {String[]} voters List of user IDs who vote this pin.
   * @apiSuccess {String[]} comments List of comments for this pin.
   * @apiSuccess {String[]} tags List of tags of this pin.
   * @apiSuccess {Object} location Location information
   * @apiSuccess {Number[]} location.coordinates Latitude and longitude of location
   * @apiSuccess {String} location.type Type of location (Point).
   * @apiSuccess {String[]} photos List of photos in this pin.
   * @apiSuccess {String[]} neighborhood List of neighborhood of this pin.
   * @apiSuccess {String[]} mentions List of mentions of this pin.
   * @apiSuccess {String[]} followers List of user IDs who follow this pin.
   * @apiSuccess {String} created_time Created time in ISO 8601 format.
   * @apiSuccess {String} updated_time Updated time in ISO 8601 format.
   * @apiSuccess {String[]} categories List of categories of this pin.
   *
   * @apiSuccessExample Success Response:
   *    HTTP/1.1 200 OK
   *    {
   *      "_id": 5798cc78652b2aab35fd663d,
   *      "status": "verified",
   *      "owner": "5787543e863804aa6045bcde",
   *      "provider": "5787543e863804aa6045bcde",
   *      "detail": "ทางเท้าพัง",
   *      "level": "normal",
   *      "videos": [],
   *      "voters": [],
   *      "comments": [],
   *      "tags": ["footpath"],
   *      "location": {
   *        "coordinates": [13.756727,100.5018549],
   *        "type": "Point"
   *      },
   *      "photos": ["https://youpin-asset-test.s3-ap-southeast-1.amazonaws.com/246c768ce23466cd6809d97f84c12db6d259f7844eafbefc21e101a1160d85b7.png"],
   *      "neighborhood": [],
   *      "mentions": [],
   *      "followers": [],
   *      "created_time": "2016-07-27T15:00:09.175Z",
   *      "updated_time": "2016-07-27T15:00:09.175Z",
   *      "categories": ["footpath"]
   *    }
   *
   * @apiError NotFound   The <code>id</code> of the Pin was not found.
   *
   * @apiErrorExample Error Response:
   *     HTTP/1.1 404 Not Found
   *     {
   *       "name":"NotFound",
   *       "message":"No record found for id '1'",
   *       "code":404,
   *       "className":"not-found",
   *       "errors":{}
   *     }
   */
  app.use('/pins', service(options));
  const pinService = app.service('/pins');
  pinService.before(hooks.before);
  pinService.after(hooks.after);
};
