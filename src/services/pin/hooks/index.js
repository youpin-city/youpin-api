// Hooks
const auth = require('feathers-authentication').hooks;
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
  patch: [],
  remove: [],
};
