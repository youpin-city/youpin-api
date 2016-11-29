const _ = require('lodash');
const errors = require('feathers-errors');

// modifySearchQuery is a before hook function to transform a summary
// query into the correct mongoose format.
const modifySearchQuery = () => (hook) => {
  const startDate = hook.params.query.start_date;
  const endDate = hook.params.query.end_date;
  const organizationName = hook.params.query.organization;
  const date = {};
  // Clean slate the query.
  hook.params.query = {}; // eslint-disable-line no-param-reassign
  // Change start_date and end_date to mongoose query format.
  if (startDate) {
    date.$gte = startDate;
  }
  if (endDate) {
    date.$lte = endDate;
  }
  if (!_.isEmpty(date)) {
    hook.params.query.date = date; // eslint-disable-line no-param-reassign
  }
  // Return error if no organization is specified.
  if (!organizationName) {
    throw new errors.BadRequest('No `organization` specified in a query');
  }
  hook.params.query.organization = organizationName; // eslint-disable-line no-param-reassign
  return Promise.resolve(hook);
};

module.exports = modifySearchQuery;
