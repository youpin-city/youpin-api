const _ = require('lodash');

const actions = require('../../../constants/actions');
const Pin = require('../../pin/pin-model');

// States
const PROCESSING = require('../../../constants/pin-states').PROCESSING;

// Roles
const DEPARTMENT_HEAD = require('../../../constants/roles').DEPARTMENT_HEAD;

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
      let delim = '';
      const allChangedFields = [];
      const allPreviousValues = [];
      const allNewValues = [];
      if (updatedFieldObjects) {
        // Add description for updated field
        if (updatedFieldObjects.length !== 0) {
          description += `${nameOfUser} edited following field:`;
          delim = '\n';
        }
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
          description += `${delim} - Edit [${key}] from "${previousValue}" to "${newValue}"`;
          delim = '\n';
        });
      }
      if (addedFieldObjects) {
        // Add description for added field
        if (addedFieldObjects.length !== 0) {
          description += `${delim}${nameOfUser} added more data to following field:`;
          delim = '\n';
        }
        // Get all added fields
        _.forEach(addedFieldObjects, (value, key) => {
          allChangedFields.push(key);
          allPreviousValues.push('');
          // Extract detail field if it is a comment object.
          const newValue = _.isObject(value) ? value.detail : value;
          allNewValues.push(newValue);
          description += `${delim} - Add [${key}] with "${newValue}"`;
          delim = '\n';
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
      // For newly assigning (null -> assigned dept.), because the pin status will
      // be changed, the notification will be handled by pin-transition service.
      // For already assigned pin, if there is a change of assigned department,
      // we need to inform both of departments' heads.
      /* eslint-disable no-underscore-dangle,no-param-reassign */
      const prevDeptId = pin.assigned_department ?
        pin.assigned_department._id : '';
      const newDeptId = updatedFieldObjects.assigned_department ?
        updatedFieldObjects.assigned_department._id : '';
      if (prevDeptId !== '' && newDeptId !== '' && prevDeptId !== newDeptId) {
        hook.data.toBeNotifiedDepartments = [prevDeptId, newDeptId];
        hook.data.toBeNotifiedRoles = [DEPARTMENT_HEAD];
      }
      // Add users to be notified by bot & email
      if (pin.status === PROCESSING && pin.assigned_users) {
        // If assigned_users change, we also need to inform newly assigned_users.
        const newAssignedUsers = updatedFieldObjects.assigned_users || [];
        hook.data.toBeNotifiedUsers = _.concat(newAssignedUsers, pin.assigned_users);
        // Exclude out the user who updates this pin.
        // Since he/she is the one who updates, notification is unnecessary.
        hook.data.toBeNotifiedUsers =
          _.differenceBy(hook.data.toBeNotifiedUsers,
            [{ _id: hook.params.user._id }], '_id');
      }
      /* eslint-enable no-underscore-dangle,no-param-reassign */
      return Promise.resolve(hook);
    })
    .catch(err => {
      throw new Error(err);
    });
};

module.exports = prepareActivityLog;
