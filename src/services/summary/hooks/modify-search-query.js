const _ = require('lodash');
const errors = require('feathers-errors');
const Organization = require('../../organization/organization-model');

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
  // Search for organization id since the legitimate query needs an id not a name.
  return Organization.findOne({ name: organizationName })
    .then(organization => {
      if (!organization) {
        throw new errors.NotFound(`No organization with a name called "${organizationName}".`);
      }
      /* eslint-disable no-param-reassign,no-underscore-dangle */
      hook.params.query.organization = organization._id;
      /* eslint-enable */
      return Promise.resolve(hook);
    })
    .catch(err => {
      throw new Error(err);
    });
};

module.exports = modifySearchQuery;
