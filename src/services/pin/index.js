const Pin = require('./pin-model');
const hooks = require('./hooks');
const service = require('feathers-mongoose');

module.exports = function () { // eslint-disable-line func-names
  const app = this;

  const options = {
    Model: Pin,
    paginate: {
      default: 5,
      max: 50,
    },
  };
  /* eslint-disable max-len */
  /**
   * @api {get} /pins/:id Get info
   * @apiVersion 0.1.0
   * @apiName GetPin
   * @apiGroup Pin
   *
   * @apiExample Example usage:
   * curl -i https://api.youpin.city/pins/5798cc78652b2aab35fd663d
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

   /**
    * @api {post} /pins Create
    * @apiVersion 0.1.0
    * @apiName PostPin
    * @apiGroup Pin
    *
    * @apiExample Example usage:
    * curl -i -X POST https://api.youpin.city/pins \
    * -H 'Content-type: application/json'  \
    * -H 'Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJfaWQiOiI1Nzk5MTBjZjE3ZmQwYjJiMmM5M2Q5NWEiLCJpYXQiOjE0Njk2NDkyMTMsImV4cCI6MTQ2OTczNTYxMywiaXNzIjoiZmVhdGhlcnMifQ.E3A4i49hI7t6VlH8b7SSKwUHyrAZfzQV8LHukOdxceU' \
    * -d @- << EOF
    * {
    *   "location": {
    *     "coordinates": [13.756727000000007, 100.5018549],
    *     "type": ["Point"]
    *   },
    *   "photos": [
    *     "https://youpin-asset-test.s3-ap-southeast-1.amazonaws.com/4c9619c7eb53be7793854fb96c3d4d718b53e510ac71371933b20e23f95a3d5e.png"
    *   ],
    *   "status": "verified",
    *   "owner": "579910cf17fd0b2b2c93d95a",
    *   "provider": ["5787543e863804aa6045bcde"],
    *   "level": "normal",
    *   "neighborhood":"",
    *   "detail":"a",
    *   "categories": ["roads"],
    *   "tags":["roads"],
    *   "created_time":1469647700940,
    *   "updated_time":1469647700940
    * }
    * EOF
    *
    * @apiHeader Content-type=application/json
    * @apiHeader Authorization Bearer access token
    *
    * @apiParam {Object} location Location information
    * @apiParam {Number[]} location.coordinates Latitude and longitude of location
    * @apiParam {String} location.type Type of location (Point).
    * @apiParam {String[]} photos List of URLs of photos in this pin.
    * @apiParam {String} status Pin's status ('verified', 'unverfied', '').
    * @apiParam {String} owner Pin's owner ID.
    * @apiParam {String} provider Pin's provider ID.
    * @apiParam {String} level Severity level.
    * @apiParam {String[]} neighborhood List of neighborhood of this pin.
    * @apiParam {String} detail Pin's detail.
    * @apiParam {String[]} categories List of categories of this pin.
    * @apiParam {String[]} tags List of tags of this pin.
    * @apiParam {String} created_time Created time in ISO 8601 format.
    * @apiParam {String} updated_time Updated time in ISO 8601 format.
    *
    * @apiSuccess (Created 201) {String} status Pin's status ('verified', 'unverfied', '').
    * @apiSuccess (Created 201) {String} owner Pin's owner ID.
    * @apiSuccess (Created 201) {String} provider Pin's provider ID.
    * @apiSuccess (Created 201) {String} level Severity level.
    * @apiSuccess (Created 201) {String} detail Pin's detail.
    * @apiSuccess (Created 201) {String} _id Pin unique ID.
    * @apiSuccess (Created 201) {String[]} videos List of videos in this pin.
    * @apiSuccess (Created 201) {String[]} voters List of user IDs who vote this pin.
    * @apiSuccess (Created 201) {String[]} comments List of comments for this pin.
    * @apiSuccess (Created 201) {String[]} tags List of tags of this pin.
    * @apiSuccess (Created 201) {Object} location Location information
    * @apiSuccess (Created 201) {Number[]} location.coordinates Latitude and longitude of location
    * @apiSuccess (Created 201) {String} location.type Type of location (Point).
    * @apiSuccess (Created 201) {String[]} photos List of photos in this pin.
    * @apiSuccess (Created 201) {String[]} neighborhood List of neighborhood of this pin.
    * @apiSuccess (Created 201) {String[]} mentions List of mentions of this pin.
    * @apiSuccess (Created 201) {String[]} followers List of user IDs who follow this pin.
    * @apiSuccess (Created 201) {String} created_time Created time in ISO 8601 format.
    * @apiSuccess (Created 201) {String} updated_time Updated time in ISO 8601 format.
    * @apiSuccess (Created 201) {String[]} categories List of categories of this pin.
    *
    * @apiSuccessExample Success Response:
    *    HTTP/1.1 201 Created
    *    {
    *      "status": "verified",
    *      "owner": "579910cf17fd0b2b2c93d95a",
    *      "provider": "5787543e863804aa6045bcde",
    *      "level": "normal",
    *      "detail": "ทดสอบระบบ",
    *      "_id": "5799129617fd0b2b2c93d95e",
    *      "videos": [],
    *      "voters": [],
    *      "comments": [],
    *      "tags": ["roads"],
    *      "location": {
    *        "coordinates":[
    *          100.5018549, 13.756727000000007
    *        ],
    *        "type": "Point"
    *      },
    *      "photos": ["https://youpin-asset-test.s3-ap-southeast-1.amazonaws.com/4c9619c7eb53be7793854fb96c3d4d718b53e510ac71371933b20e23f95a3d5e.png"],
    *      "neighborhood": [""],
    *      "mentions": [],
    *      "followers": [],
    *      "updated_time": "2016-07-27T19:28:20.940Z",
    *      "created_time": "2016-07-27T19:28:20.940Z",
    *      "categories": ["roads"]
    *    }
    *  }
    *
    * @apiError NotAuthenticated   Authentication token missing
    * @apiError GeneralError Owner field should be provided
    * @apiError BadRequest Pin validation error
    *
    * @apiErrorExample Error Response
    *     HTTP/1.1 401 Unauthorized
    *     {
    *       "name":"NotAuthenticated",
    *       "message":"Authentication token missing",
    *       "code":401,
    *       "className":"not-authenticated",
    *       "errors":{}
    *     }
    */

   /**
    * @api {put} /pins/:id Edit resource *entirely
    * @apiVersion 0.1.0
    * @apiName PutPin
    * @apiGroup Pin
    *
    * @apiExample Example usage:
    * curl -i -X PUT https://api.youpin.city/pins/578a18715862b5aa6ffc7e5f \
    * -H 'Content-type: application/json'  \
    * -H 'Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJfaWQiOiI1Nzk5MTBjZjE3ZmQwYjJiMmM5M2Q5NWEiLCJpYXQiOjE0Njk2NDkyMTMsImV4cCI6MTQ2OTczNTYxMywiaXNzIjoiZmVhdGhlcnMifQ.E3A4i49hI7t6VlH8b7SSKwUHyrAZfzQV8LHukOdxceU' \
    * -d @- << EOF
    * {
    *   "location": {
    *     "coordinates": [13.756727000000007, 100.5018549],
    *     "type": ["Point"]
    *   },
    *   "photos": [
    *     "https://youpin-asset-test.s3-ap-southeast-1.amazonaws.com/4c9619c7eb53be7793854fb96c3d4d718b53e510ac71371933b20e23f95a3d5e.png"
    *   ],
    *   "status": "verified",
    *   "owner": "579910cf17fd0b2b2c93d95a",
    *   "provider": ["5787543e863804aa6045bcde"],
    *   "level": "normal",
    *   "neighborhood":"",
    *   "detail":"a",
    *   "categories": ["roads"],
    *   "tags":["roads"],
    *   "created_time":1469647700940,
    *   "updated_time":1469647700940
    * }
    * EOF
    *
    * @apiHeader Content-type=application/json
    * @apiHeader Authorization Bearer access token
    *
    * @apiParam {Object} location Location information
    * @apiParam {Number[]} location.coordinates Latitude and longitude of location
    * @apiParam {String} location.type Type of location (Point).
    * @apiParam {String[]} photos List of URLs of photos in this pin.
    * @apiParam {String} status Pin's status ('verified', 'unverfied', '').
    * @apiParam {String} owner Pin's owner ID.
    * @apiParam {String} provider Pin's provider ID.
    * @apiParam {String} level Severity level.
    * @apiParam {String[]} neighborhood List of neighborhood of this pin.
    * @apiParam {String} detail Pin's detail.
    * @apiParam {String[]} categories List of categories of this pin.
    * @apiParam {String[]} tags List of tags of this pin.
    * @apiParam {String} created_time Created time in ISO 8601 format.
    * @apiParam {String} updated_time Updated time in ISO 8601 format.
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
    *      "status": "verified",
    *      "owner": "579910cf17fd0b2b2c93d95a",
    *      "provider": "5787543e863804aa6045bcde",
    *      "level": "normal",
    *      "detail": "ทดสอบระบบ",
    *      "_id": "5799129617fd0b2b2c93d95e",
    *      "videos": [],
    *      "voters": [],
    *      "comments": [],
    *      "tags": ["roads"],
    *      "location": {
    *        "coordinates":[
    *          100.5018549, 13.756727000000007
    *        ],
    *        "type": "Point"
    *      },
    *      "photos": ["https://youpin-asset-test.s3-ap-southeast-1.amazonaws.com/4c9619c7eb53be7793854fb96c3d4d718b53e510ac71371933b20e23f95a3d5e.png"],
    *      "neighborhood": [""],
    *      "mentions": [],
    *      "followers": [],
    *      "updated_time": "2016-07-27T19:28:20.940Z",
    *      "created_time": "2016-07-27T19:28:20.940Z",
    *      "categories": ["roads"]
    *    }
    *  }
    *
    * @apiError NotAuthenticated   Authentication token missing
    * @apiError GeneralError Owner field should be provided
    * @apiError BadRequest Pin validation error
    *
    * @apiErrorExample Error Response
    *     HTTP/1.1 401 Unauthorized
    *     {
    *       "name":"NotAuthenticated",
    *       "message":"Authentication token missing",
    *       "code":401,
    *       "className":"not-authenticated",
    *       "errors":{}
    *     }
    */

   /**
    * @api {patch} /pins/:id Edit resource *partially
    * @apiVersion 0.1.0
    * @apiName PatchPin
    * @apiGroup Pin
    *
    * @apiExample Example usage:
    * curl -i -X PATCH https://api.youpin.city/pins/578a18715862b5aa6ffc7e5f \
    * -H 'Content-type: application/json'  \
    * -H 'Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJfaWQiOiI1Nzk5MTBjZjE3ZmQwYjJiMmM5M2Q5NWEiLCJpYXQiOjE0Njk2NDkyMTMsImV4cCI6MTQ2OTczNTYxMywiaXNzIjoiZmVhdGhlcnMifQ.E3A4i49hI7t6VlH8b7SSKwUHyrAZfzQV8LHukOdxceU' \
    * -d @- << EOF
    * {
    *   "location": {
    *     "coordinates": [0, 0],
    *     "type": ["Point"]
    *   }
    * }
    * EOF
    *
    * @apiHeader Content-type=application/json
    * @apiHeader Authorization Bearer access token
    *
    * @apiParam {Object} location Location information
    * @apiParam {Number[]} location.coordinates Latitude and longitude of location
    * @apiParam {String} location.type Type of location (Point).
    * @apiParam {String[]} photos List of URLs of photos in this pin.
    * @apiParam {String} status Pin's status ('verified', 'unverfied', '').
    * @apiParam {String} owner Pin's owner ID.
    * @apiParam {String} provider Pin's provider ID.
    * @apiParam {String} level Severity level.
    * @apiParam {String[]} neighborhood List of neighborhood of this pin.
    * @apiParam {String} detail Pin's detail.
    * @apiParam {String[]} categories List of categories of this pin.
    * @apiParam {String[]} tags List of tags of this pin.
    * @apiParam {String} created_time Created time in ISO 8601 format.
    * @apiParam {String} updated_time Updated time in ISO 8601 format.
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
    *      "status": "verified",
    *      "owner": "579910cf17fd0b2b2c93d95a",
    *      "provider": "5787543e863804aa6045bcde",
    *      "level": "normal",
    *      "detail": "ทดสอบระบบ",
    *      "_id": "5799129617fd0b2b2c93d95e",
    *      "videos": [],
    *      "voters": [],
    *      "comments": [],
    *      "tags": ["roads"],
    *      "location": {
    *        "coordinates":[
    *          0, 0
    *        ],
    *        "type": "Point"
    *      },
    *      "photos": ["https://youpin-asset-test.s3-ap-southeast-1.amazonaws.com/4c9619c7eb53be7793854fb96c3d4d718b53e510ac71371933b20e23f95a3d5e.png"],
    *      "neighborhood": [""],
    *      "mentions": [],
    *      "followers": [],
    *      "updated_time": "2016-07-27T19:28:20.940Z",
    *      "created_time": "2016-07-27T19:28:20.940Z",
    *      "categories": ["roads"]
    *    }
    *  }
    *
    * @apiError NotAuthenticated   Authentication token missing
    * @apiError GeneralError Owner field should be provided
    * @apiError BadRequest Pin validation error
    *
    * @apiErrorExample Error Response
    *     HTTP/1.1 401 Unauthorized
    *     {
    *       "name":"NotAuthenticated",
    *       "message":"Authentication token missing",
    *       "code":401,
    *       "className":"not-authenticated",
    *       "errors":{}
    *     }
    */
    /* eslint-enable max-len */
  app.use('/pins', service(options));
  const pinService = app.service('/pins');
  pinService.before(hooks.before);
  pinService.after(hooks.after);
};
