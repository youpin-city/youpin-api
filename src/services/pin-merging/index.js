const errors = require('feathers-errors');

const hooks = require('./hooks');
const PinModel = require('../pin/pin-model');

class PinMergingService {
  create(data, params) {
    const pinId = params.pinId; // child pin
    const mergedParentPin = data.mergedParentPin; // parent pin

    if (!pinId) {
      throw new errors.BadRequest('Pin ID is not specified');
    }

    if (!mergedParentPin) {
      throw new errors.BadRequest('Require `mergedParentPin` in body data');
    }

    let updatedChildPin;
    let mergedChildrenPins;

    // Find child pin first to check if it does exist and has not been merged yet
    return PinModel.find({ _id: pinId })
      .then((childPin) => {
        if (!childPin) {
          return Promise.reject(`Pin ${pinId} does not exist`);
        }

        if (childPin.is_merged) {
          return Promise.reject(
            `Pin has previously been merged with parent pin ${childPin.mergedParentPin}`
          );
        }
        // Find parent pin to check if it does exist
        return PinModel.findOne({ _id: mergedParentPin });
      })
      .then((parentPin) => {
        // Save current merged children of the parent pin to be used in later promise
        mergedChildrenPins = parentPin.merged_children_pins || [];

        // Set child pin properties to be merged with parent pin
        const updatingChildPinProperties = {
          is_merged: true,
          merged_parent_pin: mergedParentPin,
        };

        // TODO: Should make it as atomic transaction to update both pins
        // Update child pin first
        return PinModel.update(
          { _id: pinId },
          { $set: updatingChildPinProperties }
        );
      })
      .then((updatedPin) => {
        // Save updated child pin to be returned in last promise
        updatedChildPin = updatedPin;

        // Set parent pin properties to include new child pin
        mergedChildrenPins.push(pinId);
        const updatingParentPinProperties = {
          merged_children_pins: mergedChildrenPins,
        };
        // Update parent pin
        return PinModel.update(
          { _id: mergedParentPin },
          { $set: updatingParentPinProperties }
        );
      })
      .then((updatedParentPin) => Promise.resolve([updatedChildPin, updatedParentPin]))
      .catch(err => Promise.reject(err));
  }
}

module.exports = function registerPinMergingService() {
  const app = this;
  app.use('/pins/:pinId/merging', new PinMergingService());

  const pinMergingService = app.service('/pins/:pinId/merging');
  pinMergingService.before(hooks.before);
  pinMergingService.after(hooks.after);
};
