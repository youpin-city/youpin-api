const authentication = require('feathers-authentication');
const FacebookStrategy = require('passport-facebook').Strategy;
const FacebookTokenStrategy = require('passport-facebook-token');
const GithubStrategy = require('passport-github').Strategy;
const GithubTokenStrategy = require('passport-github-token');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GoogleTokenStrategy = require('passport-google-token').Strategy;

module.exports = function () { // eslint-disable-line func-names
  const app = this;

  const config = app.get('auth');

  config.facebook.strategy = FacebookStrategy;
  config.facebook.tokenStrategy = FacebookTokenStrategy;
  config.github.strategy = GithubStrategy;
  config.github.tokenStrategy = GithubTokenStrategy;
  config.google.strategy = GoogleStrategy;
  config.google.tokenStrategy = GoogleTokenStrategy;

  app.set('auth', config);
  app.configure(authentication(config));
};

/* eslint-disable max-len */
/**
 * @api {post} /auth/local Login
 * @apiDescription Login to system
 * @apiVersion 0.1.0
 * @apiName Login
 * @apiGroup User
 *
 * @apiExample Example usage:
 * curl -i -X POST https://api.youpin.city/auth/local \
 * -H 'Content-type: application/json'  \
 * -d @- << EOF
 * {
 *   "email": "aunt@youpin.city",
 *   "password": "<password>"
 * }
 * EOF
 *
 * @apiHeader Content-type=application/json
 *
 * @apiParam {String} email User's email.
 * @apiParam {String} password User's password.
 *
 * @apiSuccess (Created 201) {String} token JWT Access token.
 * @apiSuccess (Created 201) {Object} data User model object

 * @apiSuccessExample Success Response:
 *    HTTP/1.1 201 Created
 *    {
 *      "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJfaWQiOiI1Nzk4OWVkNWYyNzc5MDdkMTFjZTMwMDUiLCJpYXQiOjE0Nzk3MTI5NDQsImV4cCI6MTQ3OTc5OTM0NCwiaXNzIjoiZmVhdGhlcnMifQ.lGkad0HiMEOO4pvUd-adP15UTGnx2_LvgOIbiN_Z8qA",
 *      "data": {
 *        "_id":"57989ed5f277907d11ce3005",
 *        "name":"supasate",
 *        "email":"supasate.c@gmail.com",
 *        "role":"user",
 *        "__v":0,
 *        "owner_app_id":[],
 *        "customer_app_id":[],
 *        "updated_time":"2016-07-27T11:45:25.358Z",
 *        "created_time":"2016-07-27T11:45:25.358Z",
 *        "organization_and_role_pairs":[],
 *        "department":[]
 *      }
 *    }
 *
 * @apiError Unauthorized Invalid login.
 *
 * @apiErrorExample Error Response:
 *     HTTP/1.1 401 Unauthorized
 *     {
 *       "name":"NotAuthenticated",
 *       "message":"Invalid login.",
 *       "code":401,
 *       "className":"not-authenticated",
 *       "errors":{}
 *     }
 */
 /* eslint-enable max-len */
