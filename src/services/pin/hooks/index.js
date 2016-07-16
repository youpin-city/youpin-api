'use strict';

const process = require('./process');

const globalHooks = require('../../../hooks');
const hooks = require('feathers-hooks');
const auth = require('feathers-authentication').hooks;
const stormpath = require('express-stormpath');
const errors = require('feathers-errors');

function restrictToOwnerOfPin() {
  return function(hook) {
    const pinOwner = hook.data.owner;
    const tokenOwner = hook.params.user._id;
    if (!pinOwner) {
      throw new Error('owner field should be provided');
    }
    if (pinOwner != tokenOwner) {
      throw new errors.NotAuthenticated('Owner field (id) does not matched with the token owner id.');
    }
  };
}

exports.before = {
  all: [globalHooks.swapLatLong()],
  find: [],
  get: [],
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
    restrictToOwnerOfPin()
    ],
  remove: [
    auth.verifyToken(),
    auth.populateUser(),
    auth.restrictToAuthenticated(),
    restrictToOwnerOfPin()
    ]
};

exports.after = {
  all: [globalHooks.swapLatLong()],
  find: [],
  get: [],
  create: [],
  update: [],
  patch: [],
  remove: []
};
