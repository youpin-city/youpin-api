// For after hook to log activity
// Assume that a before hook attach logInfo in proper format already
const logActivity = () => (hook) => {
  hook.app.service('/activity_logs').create(hook.data.logInfo);
};

module.exports = logActivity;
