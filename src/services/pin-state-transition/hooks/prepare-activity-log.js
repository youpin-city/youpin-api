const errors = require('feathers-errors');
const mongoose = require('mongoose');

const actions = require('../../../constants/actions');
const states = require('../../../constants/pin-states');
const Department = require('../../department/department-model');
const Pin = require('../../pin/pin-model');
// Constants
const { EMAIL_NOTI_NON_ASSIGNED_TEXT } = require('../../../constants/strings');

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
  let assignedDepartmentObject;

  return new Promise((resolve, reject) => {
    if (hook.data && hook.data.assigned_department) {
      Department.findById(hook.data.assigned_department)
        .then((foundDepartment) => {
          assignedDepartmentObject = foundDepartment;
          resolve();
        })
        .catch(err => reject(err));
    } else {
      resolve();
    }
  })
  .then(() => Pin.findById(pinId))
  .then(pin => {
    // Check next state, then, set corresponding action, changed fields, and description
    let action;
    let description;
    const previousState = pin.status;
    const changedFields = ['status'];
    const previousValues = [previousState];
    const updatedValues = [nextState];
    if (pin.assigned_department) { // eslint-disable-line no-underscore-dangle,max-len
      assignedDepartmentObject = pin.assigned_department;
    }
    /* eslint-disable no-underscore-dangle */
    switch (nextState) {
      case states.REJECTED:
        action = actions.REJECT;
        description = `${nameOfUser} rejected pin #${pinId}`;
        break;
      case states.PENDING:
        if (previousState === states.ASSIGNED) {
          // If a pin has already been assigned to a department (in ASSIGNED state),
          // but the department denies that assignment,
          // the pin's next state will go back to PENDING (and need to re-assign).
          // So, we will remove `assigned_department` value from the pin.
          action = actions.DENY;
          changedFields.push('assigned_department');
          previousValues.push(assignedDepartmentObject);
          updatedValues.push(EMAIL_NOTI_NON_ASSIGNED_TEXT);
          description = `${nameOfUser} denies pin #${pinId}`;
        } else if (previousState === states.RESOLVED) {
          // If a pin has already resolved but it is re-opened again.
          // Remove `assigned_department` value from the pin
          // and ORGANIZATION_ADMIN will do assignment again.
          action = actions.RE_OPEN;
          changedFields.push('assigned_department');
          previousValues.push(assignedDepartmentObject);
          updatedValues.push(EMAIL_NOTI_NON_ASSIGNED_TEXT);
          description = `${nameOfUser} re-opens pin #${pinId}`;
        } else if (previousState === states.REJECTED) {
          // Re-open a rejected pin. No need to change any field.
          action = actions.RE_OPEN;
          description = `${nameOfUser} re-opens pin #${pinId}`;
        }
        break;
      case states.ASSIGNED:
        action = actions.ASSIGN;
        changedFields.push('assigned_department');
        previousValues.push(EMAIL_NOTI_NON_ASSIGNED_TEXT);
        updatedValues.push(assignedDepartmentObject);
        description = `${nameOfUser} assigned pin #${pinId} ` +
                      `to department ${assignedDepartmentObject.name}`;
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
          description = `${nameOfUser} is processing pin #${pinId}`;
        } else if (previousState === states.RESOLVED) {
          // If a department marks a pin as resolved but it does not satisfy an organization admin,
          // the organization admin can send the pin back to be re-processed.
          action = actions.RE_PROCESS;
          changedFields.push('resolved_time');
          previousValues.push(pin.resolved_time);
          updatedValues.push(EMAIL_NOTI_NON_ASSIGNED_TEXT);
          description = `${nameOfUser} sent pin #${pinId} back` +
                        ` to be re-processed by ${assignedDepartmentObject.name}`;
          // Attach assigned department for later use.
          hook.data.previousAssignedDepartment = assignedDepartmentObject._id; // eslint-disable-line max-len,no-param-reassign
        }
        break;
      case states.RESOLVED:
        action = actions.RESOLVE;
        description = `${nameOfUser} marked pin #${pinId} as resolved`;
        break;
      default:
        action = null;
    }
    /* eslint-enable */

    // Prevent invalid action
    if (!action) {
      throw new errors.BadRequest('Invalid next state');
    }

    // TODO: Restructure/format all useful data that get utilised after this hook.
    // Bcoz lots of these data can be acquired by just passing the whole pin.
    // instead of passing small parts of the data here and there.
    // (pin.organization, pinId, pin..., etc.)

    // Pass logInfo object to after hook by attaching to hook.data
    const logInfo = {
      user: nameOfUser,
      organization: pin.organization,
      department,
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

    // Attach pin owner for notify hook
    hook.data.pinOwner = pin.owner; // eslint-disable-line no-param-reassign

    return Promise.resolve(hook);
  })
  .catch(err => {
    throw new Error(err);
  });
};

module.exports = prepareActivityLog;
