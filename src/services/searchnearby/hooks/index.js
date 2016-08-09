const swapLatLong = require('../../../utils/hooks/swap-lat-long');

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
  all: [swapLatLong()],
  find: [],
  get: [],
  create: [],
  update: [],
  patch: [],
  remove: [],
};
