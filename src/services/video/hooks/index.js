const validateObjectId = require('../../../utils/hooks/validate-object-id-hook');

exports.before = {
  all: [],
  find: [],
  get: [
    validateObjectId(),
  ],
  create: [],
  update: [],
  patch: [],
  remove: [],
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
