'use strict';

const errors = require('feathers-errors');
const mongoose = require('mongoose');

var validateObjectId = function() {
  return function(hook) {
    const id = hook.id;
    if (id && !mongoose.Types.ObjectId.isValid(id)) {
      throw new errors.NotFound(`No record found for id '${id}'`);
    }
  };
};

module.exports = validateObjectId;
