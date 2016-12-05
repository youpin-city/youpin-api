const auth = require('feathers-authentication').hooks;

const logActivity = require('./log-activity');
const prepareActivityLog = require('./prepare-activity-log');

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
