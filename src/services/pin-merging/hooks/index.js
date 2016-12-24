const auth = require('feathers-authentication').hooks;

const logActivity = require('./log-activity');
const prepareActivityLog = require('./prepare-activity-log');
const ORGANIZATION_ADMIN = require('../../../constants/roles').ORGANIZATION_ADMIN;
const SUPER_ADMIN = require('../../../constants/roles').SUPER_ADMIN;

exports.before = {
  all: [],
  find: [],
  get: [],
  create: [
    auth.verifyToken(),
    auth.populateUser(),
    auth.restrictToAuthenticated(),
    auth.restrictToRoles({
      roles: [SUPER_ADMIN, ORGANIZATION_ADMIN],
      fieldName: 'role',
    }),
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
