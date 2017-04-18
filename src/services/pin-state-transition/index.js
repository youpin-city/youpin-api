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
        [SUPER_ADMIN]: [PENDING, PROCESSING],
        [ORGANIZATION_ADMIN]: [PENDING, PROCESSING],
        [DEPARTMENT_HEAD]: [PENDING],
        [DEPARTMENT_OFFICER]: [],
        [USER]: [],
      },
      [REJECTED]: {
        [SUPER_ADMIN]: [PENDING],
        [ORGANIZATION_ADMIN]: [PENDING],
        [DEPARTMENT_HEAD]: [PENDING],
        [DEPARTMENT_OFFICER]: [],
        [USER]: [],
      },
    };

    // Valid if we can find nextState in a list of possible next states
    return possibleNextStates[prevState][role].indexOf(nextState) !== -1;
  }

  // Initializes app to get config values
  setup(app) {
    this.app = app;
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
      throw new errors.GeneralError(
        'Internal error: Pin has no previous state'
      );
    }

    if (!role) {
      throw new errors.GeneralError('Internal error: User has no role');
    }
    const enableStateTransitionCheck = this.app.get('enableStateTransitionCheck');
    if (
      enableStateTransitionCheck && !PinTransitionService.isValidStateTransition(
        previousState,
        nextState,
        role
      )
    ) {
      throw new errors.BadRequest(
        `Cannot change state from ${previousState} to ${nextState} with role ${role}`
      );
    }

    // Pin properties to be updated
    const updatingProperties = {
      status: nextState,
    };

    /* eslint-disable no-param-reassign */
    // Need additional property for ASSIGNED and PROCESSING states
    if (nextState === ASSIGNED) {
      if (!data.assigned_department) {
        throw new errors.BadRequest(
          'Need `assigned_department` in body data to change to `assigned` state'
        );
      }
      // pending -> assigned | Notify DEPARTMENT_HEAD to assign pin
      // to correct a person in his/her department.
      data.toBeNotifiedDepartments = [data.assigned_department];
      data.toBeNotifiedRoles = [DEPARTMENT_HEAD];
      updatingProperties.assigned_department = data.assigned_department;
      updatingProperties.assigned_time = Date.now();
    } else if (nextState === PROCESSING) {
      // Need to specify `processed_by` and `assigned_users` if the previousState is ASSIGNED.
      // If the previousState is RESOLVED, the pin already has those values.
      if (previousState === ASSIGNED) {
        if (!data.processed_by || !data.assigned_users) {
          throw new errors.BadRequest(
            'Need `processed_by` and `assigned_users` ' +
              'in body data to change to `processing` state'
          );
        }
        // assigned -> processing
        // Notify to DEPARTMENT_OFFICER or DEPARTMENT_HEAD who gets assigned.
        // Notify pin owner
        data.toBeNotifiedUsers = [data.assigned_users, data.pinOwner];
        updatingProperties.processed_by = data.processed_by;
        updatingProperties.assigned_users = data.assigned_users;
        updatingProperties.processing_time = Date.now();
      } else if (previousState === RESOLVED) {
        // resolved -> processing
        // Notify assigned DEPARTMENT_OFFICER and DEPARTMENT_HEAD
        data.toBeNotifiedDepartments = [data.previousAssignedDepartment];
        data.toBeNotifiedRoles = [DEPARTMENT_OFFICER, DEPARTMENT_HEAD];
        updatingProperties.resolved_time = null;
      }
    } else if (nextState === PENDING) {
      if (previousState === ASSIGNED) {
        // assigned/ -> pending
        // Notify back to ORGANIZATION_ADMIN to manage pin's assignment again.
        data.toBeNotifiedRoles = [ORGANIZATION_ADMIN];
        updatingProperties.assigned_department = null;
      } else if (previousState === RESOLVED) {
        // resolved -> pending
        // Notify ORGANIZATION_ADMIN to manage pin's assignment again.
        // Notify DEPARTMENT_HEAD that the resolved pin might be needed to re-fix again.
        data.toBeNotifiedRoles = [ORGANIZATION_ADMIN, DEPARTMENT_HEAD];
        updatingProperties.resolved_time = null;
        updatingProperties.assigned_department = null;
        updatingProperties.assigned_users = null;
      } else if (previousState === REJECTED) {
        // rejected -> pending
        // Notify ORGANIZATION_ADMIN to manage pin's assignment again.
        data.toBeNotifiedRoles = [ORGANIZATION_ADMIN];
        updatingProperties.rejected_time = null;
      }
    } else if (nextState === RESOLVED) {
      // processing -> resolved | notify ORGANIZATION_ADMIN
      data.toBeNotifiedRoles = [ORGANIZATION_ADMIN];
      updatingProperties.resolved_time = Date.now();
    } else if (nextState === REJECTED) {
      updatingProperties.rejected_time = Date.now();
    }
    /* eslint-enable */

    return Pin.update({ _id: pinId }, { $set: updatingProperties })
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
