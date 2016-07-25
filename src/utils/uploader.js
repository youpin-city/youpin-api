'use strict';

const multer = require('multer');

const uploader = function(fileSize) {
  return multer({
    inMemory: true,
    fileSize: fileSize,
    rename: function(fieldname, filename) {
      // generate a unique filename
      return filename.replace(/\W+/g, '-').toLowerCase() + Date.now();
    }
  });
};

module.exports = uploader;
