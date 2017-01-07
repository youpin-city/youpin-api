const _ = require('lodash');
const errors = require('feathers-errors');

const Pin = require('../../pin/pin-model');

const DEPARTMENT_HEAD = require('../../../constants/roles').DEPARTMENT_HEAD;
const ORGANIZATION_ADMIN = require('../../../constants/roles').ORGANIZATION_ADMIN;
const SUPER_ADMIN = require('../../../constants/roles').SUPER_ADMIN;


const restrictToTheRightUserForUpdate = () => (hook) => {
  const user = hook.params.user;
  const pinId = hook.id;
  // TODO: Remove unnecessary top-level 'assigned_department' field.
  // This is a workaround since using just $push returns error from mongoose.
  // We need to add one top-level field to surpass this problem.
  return Pin.findById(pinId)
    .then(pin => {
      // If only using $push, add one more top-level field to surpass mongoose error.
      if (_.has(hook.data, '$push') && _.keys(hook.data).length === 1) {
        /* eslint-disable no-param-reassign */
        hook.data.assigned_department = pin.assigned_department;
        /* eslint-enable no-param-reassign */
      }
      // Bypass if a user is a super admin or an organization admin.
      if (user.role === SUPER_ADMIN || user.role === ORGANIZATION_ADMIN) {
        return Promise.resolve(hook);
      }
      // Bypass if a user is the department head and the department owns this pin.
      if (user.role === DEPARTMENT_HEAD) {
        if (!pin.assigned_department.equals(user.department)) {
          throw new Error('The pin does not belong to the user\'s department.');
        }
        return Promise.resolve(hook);
      }
      // Otherwise, only bypass a pin owner.
      if (!pin.owner.equals(user._id)) { // eslint-disable-line no-underscore-dangle
        throw new errors.NotAuthenticated(
          'Owner field (id) does not matched with the token owner id.');
      }
      return Promise.resolve(hook);
    })
    .catch(error => {
      throw error;
    });
};

module.exports = restrictToTheRightUserForUpdate;
