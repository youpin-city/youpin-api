const errors = require('feathers-errors');
const hooks = require('./hooks');
const Pin = require('../pin/pin-model');
const roles = require('../../constants/roles');
const states = require('../../constants/pin-states');

// States
const UNVERIFIED = states.UNVERIFIED;
const VERIFIED = states.VERIFIED;
const ASSIGNED = states.ASSIGNED;
const PROCESSING = states.PROCESSING;
const RESOLVED = states.RESOLVED;
const REJECTED = states.REJECTED;

// Roles
const SUPER_ADMIN = roles.SUPER_ADMIN;
const ORGANIZATION_ADMIN = roles.ORGANIZATION_ADMIN;
const DEPARTMENT_HEAD = roles.DEPARTMENT_HEAD;
const USER = roles.USER;

class PinTransitionService {

  static isValidStateTransition(prevState, nextState, role) {
    // Map previous state and role to a list of available next states
    const possibleNextStates = {
      [UNVERIFIED]: {
        [SUPER_ADMIN]: [VERIFIED, ASSIGNED, REJECTED],
        [ORGANIZATION_ADMIN]: [VERIFIED, ASSIGNED, REJECTED],
        [DEPARTMENT_HEAD]: [],
        [USER]: [],
      },
      [VERIFIED]: {
        [SUPER_ADMIN]: [UNVERIFIED, ASSIGNED, REJECTED],
        [ORGANIZATION_ADMIN]: [UNVERIFIED, ASSIGNED, REJECTED],
        [DEPARTMENT_HEAD]: [],
        [USER]: [],
      },
      [ASSIGNED]: {
        [SUPER_ADMIN]: [],
        [ORGANIZATION_ADMIN]: [],
        [DEPARTMENT_HEAD]: [VERIFIED, PROCESSING],
        [USER]: [],
      },
      [PROCESSING]: {
        [SUPER_ADMIN]: [],
        [ORGANIZATION_ADMIN]: [],
        [DEPARTMENT_HEAD]: [RESOLVED],
        [USER]: [],
      },
      [RESOLVED]: {
        [SUPER_ADMIN]: [PROCESSING],
        [ORGANIZATION_ADMIN]: [PROCESSING],
        [DEPARTMENT_HEAD]: [],
        [USER]: [],
      },
      [REJECTED]: {
        [SUPER_ADMIN]: [],
        [ORGANIZATION_ADMIN]: [],
        [DEPARTMENT_HEAD]: [],
        [USER]: [],
      },
    };

    // Valid if we can find nextState in a list of possible next states
    return possibleNextStates[prevState][role].indexOf(nextState) !== -1;
  }

  create(data, params) {
    const pinId = params.pinId;
    const nextState = data.state;

    if (!this.isValidStateTransition(data.previousState, nextState)) {
      throw new errors.BadRequest(`Cannot change state from ${data.prevState} to ${nextState}`);
    }

    switch (nextState) {
      case REJECTED: {
        return Pin.update(
          { _id: pinId },
          { $set: { status: nextState } }
        )
        .then(() => Promise.resolve({
          pin_id: pinId,
          status: nextState,
        }))
        .catch(err => Promise.reject(err));
      }
      default: {
        return Promise.reject('Invalid next state');
      }
    }
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
