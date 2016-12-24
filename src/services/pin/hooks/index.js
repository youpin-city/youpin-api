const auth = require('feathers-authentication').hooks;

const logActivity = require('../../../utils/hooks/log-activity');
const prepareActivityLog = require('./prepare-activity-log');
const restrictToOwnerOfPin = require('../../../utils/hooks/restrict-to-owner-of-pin-hook');
const swapLatLong = require('../../../utils/hooks/swap-lat-long');
const validateObjectId = require('../../../utils/hooks/validate-object-id-hook');

exports.before = {
  all: [
    swapLatLong(),
  ],
  find: [],
  get: [
    validateObjectId(),
  ],
  create: [
    auth.verifyToken(),
    auth.populateUser(),
    auth.restrictToAuthenticated(),
    restrictToOwnerOfPin(),
  ],
  update: [
    auth.verifyToken(),
    auth.populateUser(),
    auth.restrictToAuthenticated(),
    restrictToOwnerOfPin(),
  ],
  patch: [
    auth.verifyToken(),
    auth.populateUser(),
    auth.restrictToAuthenticated(),
    restrictToOwnerOfPin(),
    prepareActivityLog(),
  ],
  remove: [
    auth.verifyToken(),
    auth.populateUser(),
    auth.restrictToAuthenticated(),
    restrictToOwnerOfPin(),
  ],
};

exports.after = {
  all: [swapLatLong()],
  find: [],
  get: [],
  create: [],
  update: [],
  patch: [logActivity()],
  remove: [],
};
