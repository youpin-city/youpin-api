const auth = require('feathers-authentication').hooks;

const logActivity = require('../../../utils/hooks/log-activity');
const sendNotifToRelatedUsers = require('../../../utils/hooks/send-notif-to-related-users');
const prepareActivityLog = require('./prepare-activity-log');

exports.before = {
  all: [],
  find: [],
  get: [],
  create: [
    auth.verifyToken(),
    auth.populateUser(),
    auth.restrictToAuthenticated(),
    prepareActivityLog(),
  ],
  update: [],
  patch: [],
  remove: [],
};

exports.after = {
  all: [],
  find: [],
  get: [],
  create: [
    logActivity(),
    sendNotifToRelatedUsers(),
  ],
  update: [],
  patch: [],
  remove: [],
};
