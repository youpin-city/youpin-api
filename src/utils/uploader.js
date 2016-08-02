const multer = require('multer');

const uploader = function uploader(fileSize) {
  return multer({
    inMemory: true,
    fileSize,
    rename(fieldname, filename) {
      // generate a unique filename
      return filename.replace(/\W+/g, '-').toLowerCase() + Date.now();
    },
  });
};

module.exports = uploader;
