const auth = require('feathers-authentication').hooks;
const uuid = require('uuid');

function generateAPIKey() {
  return (hook) => {
    hook.data.apikey = uuid.v4(); // eslint-disable-line no-param-reassign
    hook.tmpdata = { apikey: hook.data.apikey }; // eslint-disable-line no-param-reassign
  };
}

function returnAPIKeyFromTmpData() {
  return (hook) => {
    hook.result.apikey = hook.tmpdata.apikey; // eslint-disable-line no-param-reassign
  };
}

exports.before = {
  all: [
    auth.verifyToken(),
    auth.populateUser(),
    auth.restrictToAuthenticated(),
  ],
  find: [],
  get: [],
  create: [
    generateAPIKey(),
    auth.hashPassword({ passwordField: 'apikey' }),
  ],
  update: [],
  patch: [],
  remove: [],
};

exports.after = {
  all: [],
  find: [],
  get: [],
  create: [
    returnAPIKeyFromTmpData(),
  ],
  update: [],
  patch: [],
  remove: [],
};
