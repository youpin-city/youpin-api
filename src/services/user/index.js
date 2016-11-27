const user = require('./user-model');
const hooks = require('./hooks');
const service = require('feathers-mongoose');

module.exports = function () { // eslint-disable-line func-names
  const app = this;

  const options = {
    Model: user,
    paginate: {
      default: 5,
      max: 25,
    },
    // Convert mongoose document to plain object to fix facebook user patch service
    // Ref: https://github.com/feathersjs/feathers-mongoose/issues/110
    lean: true,
  };
  /* eslint-disable max-len */
  /**
   * @api {get} /users/:id Get info
   * @apiVersion 0.1.0
   * @apiName GetUsers
   * @apiGroup User
   *
   * @apiExample Example usage:
   * curl -i -X GET https://api.youpin.city/users/5798cc78652b2aab35fd663d \
   * -H 'Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJfaWQiOiI1Nzk5MTBjZjE3ZmQwYjJiMmM5M2Q5NWEiLCJpYXQiOjE0Njk2NDkyMTMsImV4cCI6MTQ2OTczNTYxMywiaXNzIjoiZmVhdGhlcnMifQ.E3A4i49hI7t6VlH8b7SSKwUHyrAZfzQV8LHukOdxceU'
   *
   * @apiParam {String} id User unique ID.
   *
   * @apiSuccess {String} _id User unique ID.
   * @apiSuccess {String} name User's full name.
   * @apiSuccess {String} email User email.
   * @apiSuccess {String} phone User phone.
   * @apiSuccess {String[]} customer_app_id App id that user belongs to.
   * @apiSuccess {String[]} owner_app_id App id that user owns.
   * @apiSuccess {String} created_time Created time in ISO 8601 format.
   * @apiSuccess {String} updated_time Updated time in ISO 8601 format.
   *
   * @apiSuccessExample Success Response:
   *    HTTP/1.1 200 OK
   *    {
   *      "_id": "5799d79113ff08ba274c1393",
   *      "name": "Auntie YouPin",
   *      "email": "auntie_youpin@youpin.city",
   *      "role": "user",
   *      "owner_app_id": ["578590a6b3e8a8e9adc78df9"],
   *      "customer_app_id": ["578580a6b3e8a8e9adc78df1"],
   *      "updated_time": "2016-07-28T09:59:45.059Z",
   *      "created_time": "2016-07-21T09:39:46.648Z"
   *    }
   *
   * @apiError NotFound   The <code>id</code> of the User was not found.
   * @apiError Forbidden Only the <code>id</code> owner is allowed to access.
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
   * @api {post} /users Add user
   * @apiVersion 0.1.0
   * @apiName PostUsers
   * @apiGroup User
   *
   * @apiExample Example usage:
   * curl -i -X POST https://api.youpin.city/users \
   * -H 'Content-type: application/json'  \
   * -d @- << EOF
   * {
   *    "name": "Auntie YouPin",
   *    "email": "auntie_youpin@youpin.city",
   *    "role": "user",
   *    "owner_app_id": ["578590a6b3e8a8e9adc78df9"],
   *    "customer_app_id": ["578580a6b3e8a8e9adc78df1"],
   * }
   * EOF
   *
   * @apiHeader Content-type=application/json
   *
   * @apiParam {String} name User's full name.
   * @apiParam {String} email User email.
   * @apiParam {String} phone User phone.
   * @apiParam {String[]} customer_app_id App id that user belongs to.
   * @apiParam {String[]} owner_app_id App id that user owns.
   * @apiParam {String} created_time Created time in ISO 8601 format.
   * @apiParam {String} updated_time Updated time in ISO 8601 format.
   *
   * @apiSuccess (Created 201) {String} _id User unique ID.
   * @apiSuccess (Created 201) {String} name User's full name.
   * @apiSuccess (Created 201) {String} email User email.
   * @apiSuccess (Created 201) {String} phone User phone.
   * @apiSuccess (Created 201) {String[]} customer_app_id App id that user belongs to.
   * @apiSuccess (Created 201) {String[]} owner_app_id App id that user owns.
   * @apiSuccess (Created 201) {String} created_time Created time in ISO 8601 format.
   * @apiSuccess (Created 201) {String} updated_time Updated time in ISO 8601 format.
   *
   * @apiSuccessExample Success Response:
   *    HTTP/1.1 201 Created
   *    {
   *      "_id": "5799d79113ff08ba274c1393",
   *      "name": "Auntie YouPin",
   *      "email": "auntie_youpin@youpin.city",
   *      "role": "user",
   *      "owner_app_id": ["578590a6b3e8a8e9adc78df9"],
   *      "customer_app_id": ["578580a6b3e8a8e9adc78df1"],
   *      "updated_time": "2016-07-28T09:59:45.059Z",
   *      "created_time": "2016-07-21T09:39:46.648Z"
   *    }
   *
   * @apiError NotAuthenticated Authentication token missing
   * @apiError Conflict Duplicate username (email)
   * @apiError BadRequest Name/password/email field is required, email validation error
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

  // Initialize our service with any options it requires
  app.use('/users', service(options));
  // Get our initialize service to that we can bind hooks
  const userService = app.service('/users');
  // Set up our before hooks
  userService.before(hooks.before);
  // Set up our after hooks
  userService.after(hooks.after);
};
