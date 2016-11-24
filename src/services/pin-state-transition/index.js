const errors = require('feathers-errors');
const hooks = require('./hooks');
const Pin = require('../pin/pin-model');
const states = require('../../constants/pin-states');

class PinTransitionService {
  isValidStateTransition(prevState, nextState) {
    const availableNextState = {
      [states.UNVERIFIED]: [states.VERIFIED, states.ASSIGNED, states.REJECTED],
      [states.VERIFIED]: [states.UNVERIFIED, states.ASSIGNED, states.REJECTED],
      [states.ASSIGNED]: [states.VERIFIED, states.PROCESSING],
      [states.PROCESSING]: [states.RESOLVED],
      [states.RESOLVED]: [states.PROCESSING],
      [states.REJECTED]: [],
    };

    return availableNextState[prevState].indexOf(nextState) !== -1;
  }

  create(data, params) {
    const pinId = params.pinId;
    const nextState = data.state;

    if (!this.isValidStateTransition(data.previousState, nextState)) {
      throw new errors.BadRequest(`Cannot change state from ${data.prevState} to ${nextState}`);
    }

    switch (nextState) {
      case states.REJECTED: {
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
