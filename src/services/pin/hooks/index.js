const auth = require('feathers-authentication').hooks;

const logActivity = require('../../../utils/hooks/log-activity');
const prepareActivityLog = require('./prepare-activity-log');
const prepareNotifInfoForCreatedPin = require('./prepare-notif-info-for-created-pin');
const restrictToOwnerOfPin = require('../../../utils/hooks/restrict-to-owner-of-pin-hook');
const restrictToTheRightUserForUpdate = require('./restrict-to-the-right-user-for-update');
const sendNotifToRelatedUsers = require('../../../utils/hooks/send-notif-to-related-users');
const swapLatLong = require('../../../utils/hooks/swap-lat-long');
const validateObjectId = require('../../../utils/hooks/validate-object-id-hook');

exports.before = {
  all: [
    swapLatLong(),
  ],
  find: [],
  get: [
    validateObjectId(),
  ],
  create: [
    auth.verifyToken(),
    auth.populateUser(),
    auth.restrictToAuthenticated(),
    restrictToOwnerOfPin(),
  ],
  update: [
    auth.verifyToken(),
    auth.populateUser(),
    auth.restrictToAuthenticated(),
    restrictToTheRightUserForUpdate(),
  ],
  patch: [
    auth.verifyToken(),
    auth.populateUser(),
    auth.restrictToAuthenticated(),
    restrictToTheRightUserForUpdate(),
    prepareActivityLog(),
  ],
  remove: [
    auth.verifyToken(),
    auth.populateUser(),
    auth.restrictToAuthenticated(),
    // TODO: Allow super admin and organization admin
    restrictToOwnerOfPin(),
  ],
};

exports.after = {
  all: [swapLatLong()],
  find: [],
  get: [],
  create: [
    prepareNotifInfoForCreatedPin(),
    sendNotifToRelatedUsers(),
  ],
  update: [],
  patch: [logActivity()],
  remove: [],
};
