const service = require('feathers-mongoose');
const app3rd = require('./app3rd-model');
const hooks = require('./hooks');

module.exports = function () { // eslint-disable-line func-names
  const app = this;

  const options = {
    Model: app3rd,
    paginate: {
      default: 5,
      max: 25,
    },
  };

  // Initialize our service with any options it requires
  app.use('/app3rds', service(options));

  // Get our initialize service to that we can bind hooks
  const app3rdService = app.service('/app3rds');

  // Set up our before hooks
  app3rdService.before(hooks.before);

  // Set up our after hooks
  app3rdService.after(hooks.after);
};
