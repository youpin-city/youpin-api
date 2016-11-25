const mongooseService = require('feathers-mongoose');
const ActivityLogModel = require('./activity-log-model');

module.exports = function registerActivityLogService() {
  const app = this;

  app.use('/activity_logs', mongooseService({ Model: ActivityLogModel }));
};
