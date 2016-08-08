const errors = require('feathers-errors');

function restrictToOwnerOfPin() {
  return (hook) => {
    const pinOwner = hook.data.owner;
    const tokenOwner = hook.params.user._id.toString(); // eslint-disable-line no-underscore-dangle
    if (!pinOwner) {
      throw new Error('owner field should be provided');
    }
    if (pinOwner !== tokenOwner) {
      throw new errors.NotAuthenticated(
        'Owner field (id) does not matched with the token owner id.');
    }
  };
}

module.exports = restrictToOwnerOfPin;
