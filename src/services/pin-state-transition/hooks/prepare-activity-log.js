const mongoose = require('mongoose');
const errors = require('feathers-errors');
const Pin = require('../../pin/pin-model');
const actions = require('../../../constants/actions');
const states = require('../../../constants/pin-states');

const safetyCheck = (hook) => {
  // hook.params.user should be populated by auth.populateUser before hook
  if (!hook.params.user) {
    throw new errors.GeneralError('Internal error: User is not populated');
  }

  // hook.params.pinId should be provided via request URL
  if (!hook.params.pinId || !mongoose.Types.ObjectId.isValid(hook.params.pinId)) {
    throw new errors.NotFound(`No pin found for id '${hook.params.pinId}'`);
  }

  // hook.data.state should be provided via body data
  if (!hook.data.state) {
    throw new errors.BadRequest('Need `state` param for state transtion');
  }
};

// Get user's departments belong to given organization
const getDepartments = (user, organization) => {
  if (!user.organization_and_department_pairs) {
    return [];
  }

  // user.organization_and_department_pairs is an array of (organization, department) pairs
  return user.organization_and_department_pairs
    .filter(pair => String(pair.organization) === String(organization))
    .map(pair => pair.department);
};

// For before hook to prepare activity log and will be used by after hook
// Note: we can't do this in after hook because we need previous pin's properties before updated
const prepareActivityLog = () => (hook) => {
  // throw error if hook is invalid
  safetyCheck(hook);

  const pinId = hook.params.pinId;
  const user = hook.params.user.name;
  const nextState = hook.data.state;

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
      case states.UNVERIFIED:
        action = actions.UNVERIFY;
        description = `${user} unverified pin ${pin._id}`;
        break;
      case states.VERIFIED:
        if (previousState === states.UNVERIFIED) {
          action = actions.VERIFY;
          description = `${user} verified pin ${pin._id}`;
        } else if (previousState === states.ASSIGNED) {
          // If a department denies assignment, remove assigned_department value
          action = actions.DENY;
          changedFields.push('assigned_department');
          previousValues.push(pin.assigned_department);
          updatedValues.push(null);
          description = `${user} denies pin ${pin._id}`;
        }
        break;
      case states.ASSIGNED:
        changedFields.push('assigned_department');
        previousValues.push(pin.assigned_department);
        updatedValues.push(hook.data.assigned_department);
        action = actions.ASSIGN;
        description = `${user} assigned pin ${pin._id} to ${pin.assigned_department}`;
        break;
      case states.PROCESSING:
        changedFields.push('processed_by');
        previousValues.push(pin.processed_by);
        updatedValues.push(hook.data.processed_by);
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
    const departments = getDepartments(hook.params.user, pin.organization);

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

    // Attach data for log-activity hook
    hook.data.logInfo = logInfo; // eslint-disable-line no-param-reassign

    // Attach data for PinTransitionService
    hook.data.previousState = previousState; // eslint-disable-line no-param-reassign

    return Promise.resolve(hook);
  })
  .catch(err => {
    throw new Error(err);
  });
};

module.exports = prepareActivityLog;
