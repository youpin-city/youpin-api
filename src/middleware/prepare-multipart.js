'use strict';


// Middleware to handle file uploading
module.exports = function(fieldName, fileSize) {

  const uploader = require('../utils/uploader')(fileSize);

  return function(req, res, next) {
    // Bypass this middleware if it's not a POST request
    if (req.method.toLowerCase() === 'post') {
      return uploader.single(fieldName)(req, res, next);
    }

    next();
  }
};
