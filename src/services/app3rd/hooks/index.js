'use strict';

const globalHooks = require('../../../hooks');
const hooks = require('feathers-hooks');
const auth = require('feathers-authentication').hooks;
const uuid = require('uuid');

function generateAPIKey() {
  return function(hook) {
    hook.data.apikey = uuid.v4();
    hook.tmpdata = { apikey: hook.data.apikey };
  };
}

function returnAPIKeyFromTmpData() {
  return function(hook) {
    hook.result.apikey = hook.tmpdata.apikey;
  };
}

exports.before = {
  all: [
    auth.verifyToken(),
    auth.populateUser(),
    auth.restrictToAuthenticated()
  ],
  find: [],
  get: [

  ],
  create: [
    generateAPIKey(),
    auth.hashPassword({passwordField: 'apikey'})
  ],
  update: [],
  patch: [],
  remove: []
};

exports.after = {
  all: [],
  find: [],
  get: [],
  create: [
    returnAPIKeyFromTmpData()
  ],
  update: [],
  patch: [],
  remove: []
};
