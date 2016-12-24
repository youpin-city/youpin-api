const errors = require('feathers-errors');
const mongoose = require('mongoose');

const MERGE_PIN = require('../../../constants/actions').MERGE_PIN;
const MERGING = require('../../../constants/actions').types.MERGING;
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

  // hook.data.mergedParent must be provided via body data
  if (!hook.data.mergedParentPin || !mongoose.Types.ObjectId.isValid(hook.data.mergedParentPin)) {
    throw new errors.BadRequest(`No parent pin found for id '${hook.data.mergedParentPin}'`);
  }
};

// For before hook to prepare activity log and will be used by after hook
// Note: we can't do this in after hook because we need previous pin's properties before updated
const prepareActivityLog = () => (hook) => {
  // throw error if hook is invalid
  safetyCheck(hook);

  const pinId = hook.params.pinId;
  const nameOfUser = hook.params.user.name;
  const departments = hook.params.user.departments;
  const mergedParentPin = hook.data.mergedParentPin;

  return Promise.all([
    Pin.findById(pinId), // child pin
    Pin.findById(mergedParentPin), // parent pin
  ])
  .then(pins => {
    const childPin = pins[0];
    const parentPin = pins[1];
    const changedFields = ['is_merged', 'merged_parent_pin'];
    const previousValues = [childPin.is_merged, childPin.merged_parent_pin];
    const updatedValues = [true, mergedParentPin];
    const childPinShortenDetail = `${childPin.detail.substring(0, 20)}...`;
    const parentPinShortenDetail = `${parentPin.detail.substring(0, 20)}...`;
    const description = `${nameOfUser} merged pin ${childPinShortenDetail} ` +
                        `to ${parentPinShortenDetail}`;

    // Pass logInfo object to after hook by attaching to hook.data
    const logInfo = {
      user: nameOfUser,
      organization: childPin.organization,
      department: departments,
      actionType: MERGING,
      action: MERGE_PIN,
      pin_id: pinId,
      changed_fields: changedFields,
      previous_values: previousValues,
      updated_values: updatedValues,
      description,
      timestamp: Date.now(),
    };

    // Attach data for log-activity hook
    hook.data.logInfo = logInfo; // eslint-disable-line no-param-reassign

    return Promise.resolve(hook);
  })
  .catch(err => {
    throw new Error(err);
  });
};

module.exports = prepareActivityLog;
