const errors = require('feathers-errors');

const hooks = require('./hooks');
const roles = require('../../constants/roles');
const states = require('../../constants/pin-states');
const Pin = require('../pin/pin-model');

// States
const ASSIGNED = states.ASSIGNED;
const PENDING = states.PENDING;
const PROCESSING = states.PROCESSING;
const REJECTED = states.REJECTED;
const RESOLVED = states.RESOLVED;

// Roles
const DEPARTMENT_HEAD = roles.DEPARTMENT_HEAD;
const DEPARTMENT_OFFICER = roles.DEPARTMENT_OFFICER;
const ORGANIZATION_ADMIN = roles.ORGANIZATION_ADMIN;
const SUPER_ADMIN = roles.SUPER_ADMIN;
const USER = roles.USER;

class PinTransitionService {

  static isValidStateTransition(prevState, nextState, role) {
    // Map previous state and role to a list of possible next states
    const possibleNextStates = {
      [PENDING]: {
        [SUPER_ADMIN]: [ASSIGNED, REJECTED],
        [ORGANIZATION_ADMIN]: [ASSIGNED, REJECTED],
        [DEPARTMENT_HEAD]: [],
        [DEPARTMENT_OFFICER]: [],
        [USER]: [],
      },
      [ASSIGNED]: {
        [SUPER_ADMIN]: [PENDING, PROCESSING],
        [ORGANIZATION_ADMIN]: [],
        [DEPARTMENT_HEAD]: [PENDING, PROCESSING],
        [DEPARTMENT_OFFICER]: [],
        [USER]: [],
      },
      [PROCESSING]: {
        [SUPER_ADMIN]: [RESOLVED],
        [ORGANIZATION_ADMIN]: [],
        [DEPARTMENT_HEAD]: [RESOLVED],
        [DEPARTMENT_OFFICER]: [],
        [USER]: [],
      },
      [RESOLVED]: {
        [SUPER_ADMIN]: [PROCESSING],
        [ORGANIZATION_ADMIN]: [PROCESSING],
        [DEPARTMENT_HEAD]: [],
        [DEPARTMENT_OFFICER]: [],
        [USER]: [],
      },
      [REJECTED]: {
        [SUPER_ADMIN]: [],
        [ORGANIZATION_ADMIN]: [],
        [DEPARTMENT_HEAD]: [],
        [DEPARTMENT_OFFICER]: [],
        [USER]: [],
      },
    };

    // Valid if we can find nextState in a list of possible next states
    return possibleNextStates[prevState][role].indexOf(nextState) !== -1;
  }

  // Create new state transition (i.e. change state)
  create(data, params) {
    const pinId = params.pinId;
    const nextState = data.state;
    const previousState = data.previousState;
    const role = params.user.role;

    if (!pinId) {
      throw new errors.BadRequest('Pin ID is not specified');
    }
    if (!nextState) {
      throw new errors.BadRequest('Need `state` in body data to change state');
    }

    if (!previousState) {
      throw new errors.GeneralError('Internal error: Pin has no previous state');
    }

    if (!role) {
      throw new errors.GeneralError('Internal error: User has no role');
    }

    if (!PinTransitionService.isValidStateTransition(previousState, nextState, role)) {
      throw new errors.BadRequest(
        `Cannot change state from ${previousState} to ${nextState} with role ${role}`
      );
    }

    // Pin properties to be updated
    const updatingProperties = {
      status: nextState,
    };

    // Need additional property for ASSIGNED and PROCESSING states
    if (nextState === ASSIGNED) {
      if (!data.assigned_department) {
        throw new errors.BadRequest(
          'Need `assigned_department` in body data to change to `assigned` state'
        );
      }
      updatingProperties.assigned_department = data.assigned_department;
    } else if (nextState === PROCESSING) {
      // Need to specify `processed_by` and `assigned_users` if the previousState is ASSIGNED.
      // If the previousState is RESOLVED, the pin already has those values.
      if (previousState === ASSIGNED && (!data.processed_by || !data.assigned_users)) {
        throw new errors.BadRequest(
          'Need `processed_by` and `assigned_users` in body data to change to `processing` state'
        );
      }
      updatingProperties.processed_by = data.processed_by;
      updatingProperties.assigned_users = data.assigned_users;
    }

    return Pin.update(
      { _id: pinId },
      { $set: updatingProperties }
    )
    .then(() => Promise.resolve(Object.assign(updatingProperties, { pinId })))
    .catch(err => Promise.reject(err));
  }
}

module.exports = function registerStateTransitionService() {
  const app = this;
  app.use('/pins/:pinId/state_transition', new PinTransitionService());

  const pinTransitionService = app.service('/pins/:pinId/state_transition');
  pinTransitionService.before(hooks.before);
  pinTransitionService.after(hooks.after);
};

module.exports.PinTransitionService = PinTransitionService;
