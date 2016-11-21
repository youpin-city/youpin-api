const fs = require('fs');
const path = require('path');
const winston = require('winston');

module.exports = function (app) { // eslint-disable-line func-names
  // Add a logger to our app object for convenience
  app.logger = winston; // eslint-disable-line no-param-reassign

  // Get log setting from config file
  const logConfig = app.get('logger');

  // Let winston write logs to a file
  if (process.env.NODE_ENV !== 'test') {
    // Create a log folder if it does not exist
    if (!fs.existsSync(logConfig.path)) {
      fs.mkdirSync(logConfig.path);
    }
    // Set file to be written
    winston.add(winston.transports.File, {
      filename: path.join(logConfig.path, logConfig.filename),
    });
  } else {
    // In test environment, do not print log to console
    winston.remove(winston.transports.Console);
  }

  return (error, req, res, next) => {
    if (error) {
      const message = `${error.code ?
        `(${error.code}) ` : ''}Route: ${req.url} - ${error.message}`;

      if (error.code === 404) {
        winston.info(message);
      } else {
        winston.error(message);
        winston.info(error.stack);
      }
    }

    next(error);
  };
};
