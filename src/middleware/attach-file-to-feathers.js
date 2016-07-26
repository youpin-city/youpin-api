'use strict';

// Middleware to attach a file from multer (uploader) to the req object
module.exports = function() {
  return function(req, res, next) {
    // Bypass this middleware if it's not a POST request or file is not available
    if (req.method.toLowerCase() === 'post' && req.file) {
      req.feathers.file = req.file;
    }

    next();
  }
}
