const globalHooks = require('../../../hooks');

exports.before = {
  all: [],
  find: [],
  get: [],
  create: [],
  update: [],
  patch: [],
  remove: [],
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
