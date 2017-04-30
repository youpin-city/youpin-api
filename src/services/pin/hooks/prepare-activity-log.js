const _ = require('lodash');

const actions = require('../../../constants/actions');
const Pin = require('../../pin/pin-model');

// States
const PROCESSING = require('../../../constants/pin-states').PROCESSING;

// For before hook to prepare activity log and will be used by after hook
// Note: we can't do this in after hook because we need previous pin's properties before updated
const prepareActivityLog = () => (hook) => {
  const nameOfUser = hook.params.user.name;
  const pinId = hook.id;
  return Pin.findById(pinId)
    .then(pin => {
      // Separate updated/added fields
      const updatedFieldObjects = _.omit(hook.data, ['$push', 'owner']);
      const addedFieldObjects = hook.data.$push;

      let description = '';
      const allChangedFields = [];
      const allPreviousValues = [];
      const allNewValues = [];
      // Add description if there is any changed field.
      if (updatedFieldObjects.length !== 0 || addedFieldObjects.length !== 0) {
        description += `${nameOfUser} edited pin #${pinId}`;
      }
      if (updatedFieldObjects) {
        // Get all updated fields
        _.forEach(updatedFieldObjects, (value, key) => {
          let previousValue = pin[key];
          let newValue = value;
          // Add special case for location's coordinates
          if (key === 'location') {
            previousValue = pin[key].coordinates.toString();
            newValue = value.coordinates.toString();
          }
          allChangedFields.push(key);
          allPreviousValues.push(previousValue);
          allNewValues.push(newValue);
        });
      }
      if (addedFieldObjects) {
        // Get all added fields
        _.forEach(addedFieldObjects, (value, key) => {
          allChangedFields.push(key);
          allPreviousValues.push('');
          // Extract detail field if it is a comment object.
          const newValue = _.isObject(value) ? value.detail : value;
          allNewValues.push(newValue);
        });
      }
      // Pass logInfo object to after hook by attaching to hook.data
      const logInfo = {
        user: nameOfUser,
        organization: pin.organization,
        department: pin.assigned_department,
        actionType: actions.types.METADATA,
        action: actions.UPDATE_PIN,
        pin_id: pinId,
        changed_fields: allChangedFields,
        previous_values: allPreviousValues,
        updated_values: allNewValues,
        description,
        timestamp: Date.now(),
      };
      // Attach data for log-activity hook
      hook.data.logInfo = logInfo; // eslint-disable-line no-param-reassign
      // Add users to be notified by bot & email
      if (pin.status === PROCESSING && pin.assigned_users) {
        // Exclude out the user who updates this pin.
        // Since he/she is the one who updates, notification is unnecessary.
        hook.data.toBeNotifiedUsers = // eslint-disable-line no-param-reassign
          _.differenceBy(pin.assigned_users,
            [{ _id: hook.params.user._id }], '_id'); // eslint-disable-line no-underscore-dangle
      }
      return Promise.resolve(hook);
    })
    .catch(err => {
      throw new Error(err);
    });
};

module.exports = prepareActivityLog;
