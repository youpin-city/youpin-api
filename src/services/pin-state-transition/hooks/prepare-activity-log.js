const errors = require('feathers-errors');
const mongoose = require('mongoose');

const actions = require('../../../constants/actions');
const states = require('../../../constants/pin-states');
const Pin = require('../../pin/pin-model');

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
};

// For before hook to prepare activity log and will be used by after hook
// Note: we can't do this in after hook because we need previous pin's properties before updated
const prepareActivityLog = () => (hook) => {
  // throw error if hook is invalid
  safetyCheck(hook);

  const pinId = hook.params.pinId;
  const nameOfUser = hook.params.user.name;
  const department = hook.params.user.department;
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
    // Variables to keep track of department or people to be notified the change by Bot.
    const toBeNotifiedDepartments = [];
    let toBeNotifiedUsers = [];
    // Add current assigned_department/assigned_users to notification lists.
    if (pin.assigned_department && pin.assigned_department._id) { // eslint-disable-line no-underscore-dangle,max-len
      toBeNotifiedDepartments.push(pin.assigned_department._id); // eslint-disable-line no-underscore-dangle,max-len
    }
    if (pin.assigned_users) {
      toBeNotifiedUsers = toBeNotifiedUsers.concat(pin.assigned_users);
    }
    /* eslint-disable no-underscore-dangle */
    switch (nextState) {
      case states.REJECTED:
        action = actions.REJECT;
        description = `${nameOfUser} rejected pin ${shortenDetail}`;
        break;
      case states.PENDING:
        // If a pin has already been assigned to a department (in ASSIGNED state),
        // but the department denies that assignment,
        // the pin's next state will go back to PENDING (and need to re-assign).
        // So, we will remove `assigned_department` value from the pin.
        action = actions.DENY;
        changedFields.push('assigned_department');
        previousValues.push(pin.assigned_department);
        updatedValues.push(null);
        description = `${nameOfUser} denies pin ${shortenDetail}`;
        break;
      case states.ASSIGNED:
        action = actions.ASSIGN;
        changedFields.push('assigned_department');
        previousValues.push(pin.assigned_department);
        updatedValues.push(hook.data.assigned_department);
        // Add the new assigned_department to notification list.
        toBeNotifiedDepartments.push(hook.data.assigned_department);
        description = `${nameOfUser} assigned pin ${shortenDetail} ` +
                      `to department ${hook.data.assigned_department}`;
        break;
      case states.PROCESSING:
        if (previousState === states.ASSIGNED) {
          if (!hook.data.processed_by) {
            throw new errors.BadRequest('Need `processed_by` body data for `processing` state');
          }
          if (!hook.data.assigned_users) {
            throw new errors.BadRequest('Need `assigned_users` body data for `processing` state');
          }
          action = actions.PROCESS;
          changedFields.push('processed_by');
          previousValues.push(pin.processed_by);
          updatedValues.push(hook.data.processed_by);
          changedFields.push('assigned_users');
          previousValues.push(pin.assigned_users);
          updatedValues.push(hook.data.assigned_users);
          description = `${nameOfUser} is processing pin ${shortenDetail}`;
        } else if (previousState === states.RESOLVED) {
          // If a department marks a pin as resolved but it does not satisfy an organization admin,
          // the organization admin can send the pin back to be re-processed.
          action = actions.RE_PROCESS;
          changedFields.push('resolved_time');
          previousValues.push(pin.resolved_time);
          updatedValues.push(null);
          description = `${nameOfUser} sent pin ${shortenDetail} back` +
                        ` to be re-processed by ${pin.assigned_department}`;
        }
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

    // Pass logInfo object to after hook by attaching to hook.data
    const logInfo = {
      user: nameOfUser,
      organization: pin.organization,
      department,
      toBeNotifiedDepartments,
      toBeNotifiedUsers,
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
