const auth = require('feathers-authentication').hooks;
const hooks = require('feathers-hooks');

const handleFacebookCreate = require('./handle-facebook-create');
const validateObjectId = require('../../../utils/hooks/validate-object-id-hook');

// roles
const {
  DEPARTMENT_HEAD,
  DEPARTMENT_OFFICER,
  EXECUTIVE_ADMIN,
  ORGANIZATION_ADMIN,
  SUPER_ADMIN,
} = require('../../../constants/roles');

exports.before = {
  all: [],
  find: [
    auth.verifyToken(),
    auth.populateUser(),
    auth.restrictToAuthenticated(),
    auth.restrictToRoles({
      roles: [
        SUPER_ADMIN,
        ORGANIZATION_ADMIN,
        EXECUTIVE_ADMIN,
        DEPARTMENT_HEAD,
        DEPARTMENT_OFFICER,
      ],
      fieldName: 'role',
    }),
  ],
  get: [
    auth.verifyToken(),
    auth.populateUser(),
    auth.restrictToAuthenticated(),
    validateObjectId(),
    auth.restrictToRoles({
      roles: [
        SUPER_ADMIN,
        ORGANIZATION_ADMIN,
        EXECUTIVE_ADMIN,
        DEPARTMENT_HEAD,
        DEPARTMENT_OFFICER,
      ],
      fieldName: 'role',
      owner: true,
      ownerField: '_id',
    }),
  ],
  create: [
    handleFacebookCreate(),
    auth.hashPassword(),
  ],
  update: [
    auth.verifyToken(),
    auth.populateUser(),
    auth.restrictToAuthenticated(),
    auth.restrictToRoles({
      roles: [SUPER_ADMIN, ORGANIZATION_ADMIN, EXECUTIVE_ADMIN],
      fieldName: 'role',
      owner: true,
      ownerField: '_id',
    }),
  ],
  patch: [
    auth.verifyToken(),
    auth.populateUser(),
    auth.restrictToAuthenticated(),
    auth.restrictToRoles({
      roles: [SUPER_ADMIN, ORGANIZATION_ADMIN, EXECUTIVE_ADMIN],
      fieldName: 'role',
      owner: true,
      ownerField: '_id',
    }),
  ],
  remove: [
    auth.verifyToken(),
    auth.populateUser(),
    auth.restrictToAuthenticated(),
    auth.restrictToRoles({
      roles: [SUPER_ADMIN, ORGANIZATION_ADMIN, EXECUTIVE_ADMIN],
      fieldName: 'role',
      owner: true,
      ownerField: '_id',
    }),
  ],
};

exports.after = {
  all: [hooks.remove('password')],
  find: [],
  get: [],
  create: [],
  update: [],
  patch: [],
  remove: [],
};
