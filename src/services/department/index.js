const service = require('feathers-mongoose');

const Department = require('./department-model');
const hooks = require('./hooks');

module.exports = function () { // eslint-disable-line func-names
  const app = this;

  const options = {
    Model: Department,
    paginate: {
      default: 5,
      max: 25,
    },
  };

  // Initialize our service with any options it requires
  app.use('/departments', service(options));

  // Get our initialize service to that we can bind hooks
  const departmentService = app.service('/departments');

  // Set up our before hooks
  departmentService.before(hooks.before);

  // Set up our after hooks
  departmentService.after(hooks.after);
};
