const mongoose = require('mongoose');
const errors = require('feathers-errors');
const Pin = require('../../pin/pin-model');
const actions = require('../../../constants/actions');
const states = require('../../../constants/pin-states');

const safetyCheck = (hook) => {
  // hook.params.user must be populated by auth.populateUser before hook
  if (!hook.params.user) {
    throw new errors.GeneralError('Internal error: User is not populated');
  }

  // hook.params.pinId must be provided via request URL
  if (!hook.params.pinId || !mongoose.Types.ObjectId.isValid(hook.params.pinId)) {
    throw new errors.NotFound(`No pin found for id '${hook.params.pinId}'`);
  }

  // hook.data.state must be provided via body data
  if (!hook.data.state) {
    throw new errors.BadRequest('Need `state` body data for state transtion');
  }

  // hook.data.assigned_department must be provided for `assigned` state transtion
  if (hook.data.state === states.ASSIGNED && !hook.data.assigned_department) {
    throw new errors.BadRequest('Need `assigned_department` body data for `assigned` state');
  }

  // hook.data.processed_by must be provided for `processing` state transtion
  if (hook.data.state === states.PROCESSING && !hook.data.processed_by) {
    throw new errors.BadRequest('Need `processed_by` body data for `processing` state');
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
  const nameOfUser = hook.params.user.name;
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
    const shortenDetail = `${pin.detail.substring(0, 20)}...`;

    /* eslint-disable no-underscore-dangle */
    switch (nextState) {
      case states.REJECTED:
        action = actions.REJECT;
        description = `${nameOfUser} rejected pin ${shortenDetail}`;
        break;
      case states.UNVERIFIED:
        action = actions.UNVERIFY;
        description = `${nameOfUser} unverified pin ${shortenDetail}`;
        break;
      case states.VERIFIED:
        if (previousState === states.UNVERIFIED) {
          action = actions.VERIFY;
          description = `${nameOfUser} verified pin ${shortenDetail}`;
        } else if (previousState === states.ASSIGNED) {
          // If a pin has already been assigned to a department (in ASSIGNED state),
          // but the department denies that assignment,
          // the pin's next state will go back to VERIFIED (and need to re-assign).
          // So, we will remove `assigned_department` value from the pin.
          action = actions.DENY;
          changedFields.push('assigned_department');
          previousValues.push(pin.assigned_department);
          updatedValues.push(null);
          description = `${nameOfUser} denies pin ${shortenDetail}`;
        }
        break;
      case states.ASSIGNED:
        action = actions.ASSIGN;
        changedFields.push('assigned_department');
        previousValues.push(pin.assigned_department);
        updatedValues.push(hook.data.assigned_department);
        description = `${nameOfUser} assigned pin ${shortenDetail} to ${pin.assigned_department}`;
        break;
      case states.PROCESSING:
        action = actions.PROCESS;
        changedFields.push('processed_by');
        previousValues.push(pin.processed_by);
        updatedValues.push(hook.data.processed_by);
        description = `${nameOfUser} is processing pin ${shortenDetail}`;
        break;
      case states.RESOLVED:
        action = actions.RESOLVE;
        description = `${nameOfUser} marked pin ${shortenDetail} as resolved`;
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
      user: nameOfUser,
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
