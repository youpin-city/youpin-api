const auth = require('feathers-authentication').hooks;
const validateObjectId = require('../../../utils/hooks/validate-object-id-hook');
const SUPER_ADMIN = require('../../../constants/roles').SUPER_ADMIN;

exports.before = {
  all: [],
  find: [],
  get: [
    validateObjectId(),
  ],
  create: [
    auth.verifyToken(),
    auth.populateUser(),
    auth.restrictToRoles({
      roles: [SUPER_ADMIN],
      fieldName: 'role',
    }),
  ],
  update: [
    auth.verifyToken(),
    auth.populateUser(),
    auth.restrictToRoles({
      roles: [SUPER_ADMIN],
      fieldName: 'role',
    }),
  ],
  patch: [
    auth.verifyToken(),
    auth.populateUser(),
    auth.restrictToRoles({
      roles: [SUPER_ADMIN],
      fieldName: 'role',
    }),
  ],
  remove: [
    auth.verifyToken(),
    auth.populateUser(),
    auth.restrictToRoles({
      roles: [SUPER_ADMIN],
      fieldName: 'role',
    }),
  ],
};

exports.after = {
  all: [],
  find: [],
  get: [],
  create: [],
  update: [],
  patch: [],
  remove: [],
};
