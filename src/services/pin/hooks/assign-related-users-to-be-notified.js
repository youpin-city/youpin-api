// Roles
const ORGANIZATION_ADMIN = require('../../../constants/roles').ORGANIZATION_ADMIN;

// We assign related department/roles/users to be notified here which will
// get processed again in after hook by sendNotifToRelatedUsers()
const assignRelatedUsersToBeNotified = () => (hook) => {
  hook.data.toBeNotifiedRoles = [ORGANIZATION_ADMIN]; // eslint-disable-line no-param-reassign
};

module.exports = assignRelatedUsersToBeNotified;
