const mongoose = require('mongoose');
const errors = require('feathers-errors');
const Pin = require('../../pin/pin-model');
const actions = require('../../../constants/actions');
const states = require('../../../constants/pin-states');

// For before hook to prepare activity log and will be used by after hook
// Note: we can't do this in after hook because we need previous pin's properties before updated
const prepareActivityLog = () => (hook) => {
  const pinId = hook.params.pinId;
  const user = hook.params.user.name;
  const nextState = hook.data.state;

  // Prevent invalid pin id
  if (pinId && !mongoose.Types.ObjectId.isValid(pinId)) {
    throw new errors.NotFound(`No pin found for id '${pinId}'`);
  }

  // A good convention for a hook is to always return a promise.
  // See https://docs.feathersjs.com/hooks/readme.html
  return Pin.findById(pinId)
  .then(pin => {
    // Check next state, then, set corresponding action, changed fields, and description
    let action;
    let description;
    const previousState = pin.status;
    const changedFields = ['status'];
    const previousValues = [previousState];
    const updatedValues = [nextState];

    /* eslint-disable no-underscore-dangle */
    switch (nextState) {
      case states.REJECTED:
        action = actions.REJECT;
        description = `${user} rejected pin ${pin._id}`;
        break;

      case states.VERIFIED:
        if (previousState === states.UNVERIFIED) {
          action = actions.VERIFY;
          description = `${user} verified pin ${pin._id}`;
        } else if (previousState === states.ASSIGNED) {
          // If a department denies assignment, remove assigned_department value
          action = actions.DENY;
          changedFields.append('assigned_department');
          previousValues.append(pin.assigned_department);
          updatedValues.append(null);
          description = `${user} denies pin ${pin._id}`;
        }
        break;

      case states.ASSIGNED:
        changedFields.append('assigned_department');
        previousValues.append(pin.assigned_department);
        updatedValues.append(hook.data.assigned_department);
        action = actions.ASSIGN;
        description = `${user} assigned pin ${pin._id} to ${pin.assigned_department}`;
        break;

      case states.PROCESSING:
        action = actions.PROCESS;
        description = `${user} is processing pin ${pin._id}`;
        break;

      case states.RESOLVED:
        action = actions.RESOLVE;
        description = `${user} marked pin ${pin._id} as resolved`;
        break;

      default:
        action = null;
    }
    /* eslint-enable */

    // Prevent invalid action
    if (!action) {
      throw new errors.BadRequest('Invalid next state');
    }

    // Get user's departments of this organization
    const departments =
      hook.params.user.organization_and_department_pairs
      .filter(pair => String(pair.organization) === String(pin.organization))
      .map(pair => pair.department);

    // Pass logInfo object to after hook by attaching to hook.data
    const logInfo = {
      user,
      organization: pin.organization,
      department: departments,
      actionType: actions.types.STATE_TRANSITION,
      action,
      pin_id: pinId,
      changed_fields: changedFields,
      previous_values: previousValues,
      updated_values: updatedValues,
      description,
      timestamp: Date.now(),
    };
    hook.data.logInfo = logInfo; // eslint-disable-line no-param-reassign
    hook.data.previousState = previousState; // eslint-disable-line no-param-reassign
  })
  .catch(err => {
    throw new Error(err);
  });
};

module.exports = prepareActivityLog;
