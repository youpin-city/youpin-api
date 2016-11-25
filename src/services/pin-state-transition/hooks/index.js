const auth = require('feathers-authentication').hooks;
const prepareActivityLog = require('./prepare-activity-log');
const logActivity = require('./log-activity');

exports.before = {
  all: [],
  find: [],
  get: [],
  create: [
    auth.verifyToken(),
    auth.populateUser(),
    auth.restrictToAuthenticated(),
    prepareActivityLog(),
  ],
  update: [],
  patch: [],
  remove: [],
};

exports.after = {
  all: [],
  find: [],
  get: [],
  create: [logActivity()],
  update: [],
  patch: [],
  remove: [],
};
