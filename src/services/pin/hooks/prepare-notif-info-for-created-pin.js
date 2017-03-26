// Roles
const ORGANIZATION_ADMIN = require('../../../constants/roles').ORGANIZATION_ADMIN;

// We assign related department/roles/users to be notified here which will
// get processed again in after hook by sendNotifToRelatedUsers()
const prepareNotifInfoForCreatedPin = () => (hook) => {
  hook.data.toBeNotifiedRoles = [ORGANIZATION_ADMIN]; // eslint-disable-line no-param-reassign
  hook.data.logInfo = { // eslint-disable-line no-param-reassign
    description: 'A new pin is created.',
    pin_id: hook.result._id, // eslint-disable-line no-underscore-dangle
  };
};

module.exports = prepareNotifInfoForCreatedPin;
