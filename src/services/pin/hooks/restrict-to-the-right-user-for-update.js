const _ = require('lodash');
const errors = require('feathers-errors');

const Pin = require('../../pin/pin-model');

const { USER } = require('../../../constants/roles');


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
      // Allow all authenticated users except normal users
      if (user.role === USER) {
        throw new errors.NotAuthenticated('You are not authorized to update this pin.');
      }

      return Promise.resolve(hook);
    })
    .catch(error => {
      throw error;
    });
};

module.exports = restrictToTheRightUserForUpdate;
