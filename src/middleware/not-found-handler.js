const errors = require('feathers-errors');

module.exports = function () { // eslint-disable-line func-names
  return (req, res, next) => {
    next(new errors.NotFound('Page not found'));
  };
};
