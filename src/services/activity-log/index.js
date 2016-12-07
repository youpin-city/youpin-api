const mongooseService = require('feathers-mongoose');

const ActivityLog = require('./activity-log-model');

module.exports = function registerActivityLogService() {
  const app = this;

  app.use('/activity_logs', mongooseService({ Model: ActivityLog }));
};
