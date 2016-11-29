const auth = require('feathers-authentication').hooks;
const modifySearchQuery = require('./modify-search-query');
const ORGANIZATION_ADMIN = require('../../../constants/roles').ORGANIZATION_ADMIN;
const SUPER_ADMIN = require('../../../constants/roles').SUPER_ADMIN;
const triggerCalculation = require('./trigger-calculation.js');
const validateObjectId = require('../../../utils/hooks/validate-object-id-hook');

exports.before = {
  all: [],
  find: [
    triggerCalculation(),
    modifySearchQuery(),
  ],
  get: [validateObjectId()],
  create: [
    auth.verifyToken(),
    auth.populateUser(),
    auth.restrictToRoles({
      roles: [SUPER_ADMIN, ORGANIZATION_ADMIN],
      fieldName: 'role',
    }),
  ],
  update: [
    auth.verifyToken(),
    auth.populateUser(),
    auth.restrictToRoles({
      roles: [SUPER_ADMIN, ORGANIZATION_ADMIN],
      fieldName: 'role',
    }),
  ],
  patch: [
    auth.verifyToken(),
    auth.populateUser(),
    auth.restrictToRoles({
      roles: [SUPER_ADMIN, ORGANIZATION_ADMIN],
      fieldName: 'role',
    }),
  ],
  remove: [
    auth.verifyToken(),
    auth.populateUser(),
    auth.restrictToRoles({
      roles: [SUPER_ADMIN, ORGANIZATION_ADMIN],
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

