const service = require('feathers-mongoose');
const hooks = require('./hooks');
const Summary = require('./summary-model');

module.exports = function () { // eslint-disable-line func-names
  const app = this;

  const options = {
    Model: Summary,
    paginate: {
      default: 5,
      max: 25,
    },
  };

  app.use('/summaries', service(options));
  const summaryService = app.service('/summaries');
  summaryService.before(hooks.before);
  summaryService.after(hooks.after);
};
