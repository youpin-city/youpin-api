// Middleware to handle file uploading
module.exports = function (fieldName, fileSize) { // eslint-disable-line func-names
  const uploader = require('../utils/uploader')(fileSize); // eslint-disable-line global-require

  return (req, res, next) => {
    // Bypass this middleware if it's not a POST request
    if (req.method.toLowerCase() === 'post') {
      return uploader.single(fieldName)(req, res, next);
    }

    return next();
  };
};
