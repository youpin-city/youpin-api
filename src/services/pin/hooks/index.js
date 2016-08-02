const globalHooks = require('../../../hooks');
const auth = require('feathers-authentication').hooks;
const errors = require('feathers-errors');
const mongoose = require('mongoose');

function restrictToOwnerOfPin() {
  return (hook) => {
    const pinOwner = hook.data.owner;
    const tokenOwner = hook.params.user._id.toString(); // eslint-disable-line no-underscore-dangle
    if (!pinOwner) {
      throw new Error('owner field should be provided');
    }
    if (pinOwner !== tokenOwner) {
      throw new errors.NotAuthenticated(
        'Owner field (id) does not matched with the token owner id.');
    }
  };
}

function validateObjectId() {
  return (hook) => {
    const id = hook.id;

    if (id && !mongoose.Types.ObjectId.isValid(id)) {
      throw new errors.NotFound(`No record found for id '${id}'`);
    }
  };
}

exports.before = {
  all: [
    globalHooks.swapLatLong(),
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
  all: [globalHooks.swapLatLong()],
  find: [],
  get: [],
  create: [],
  update: [],
  patch: [],
  remove: [],
};
