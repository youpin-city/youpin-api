const auth = require('feathers-authentication').hooks;

const logActivity = require('./log-activity');
const prepareActivityLog = require('./prepare-activity-log');

const {
  DEPARTMENT_HEAD,
  DEPARTMENT_OFFICER,
  EXECUTIVE_ADMIN,
  ORGANIZATION_ADMIN,
  PUBLIC_RELATIONS,
  SUPER_ADMIN,
} = require('../../../constants/roles');

exports.before = {
  all: [],
  find: [],
  get: [],
  create: [
    auth.verifyToken(),
    auth.populateUser(),
    auth.restrictToAuthenticated(),
    auth.restrictToRoles({
      roles: [
        DEPARTMENT_HEAD,
        DEPARTMENT_OFFICER,
        EXECUTIVE_ADMIN,
        ORGANIZATION_ADMIN,
        PUBLIC_RELATIONS,
        SUPER_ADMIN,
      ],
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
