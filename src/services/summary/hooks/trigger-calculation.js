const _ = require('lodash');
const moment = require('moment');
const ActivityLog = require('../../activity-log/activity-log-model');
const actions = require('../../../constants/actions');
const Summary = require('../../summary/summary-model');

// triggerCalculation is a before hook function to trigger a summary
// calculation on specified dates and organization.
// If no date specifies, it will calculate today's summary.
const triggerCalculation = () => (hook) => {
  const startDate = hook.params.query.start_date;
  const endDate = hook.params.query.end_date;
  const organizationName = hook.params.query.organization;
  const trigger = hook.params.query.trigger;
  if (!trigger) {
    return Promise.resolve(hook);
  }
  let timestamp = {};
  // Change start_date and end_date to mongoose query format.
  if (startDate) {
    timestamp.$gte = startDate;
  }
  if (endDate) {
    timestamp.$lte = endDate;
  }
  if (_.isEmpty(timestamp)) {
    timestamp = moment().format('YYYY-MM-DD');
  }
  // Start a calculation
  const query = {
    organization: organizationName,
    timestamp,
  };
  // Initialise summary with zeros.
  const initialSummary = {
    [actions.VERIFY]: 0,
    [actions.UNVERIFY]: 0,
    [actions.ASSIGN]: 0,
    [actions.DENY]: 0,
    [actions.PROCESS]: 0,
    [actions.RESOLVE]: 0,
    [actions.REJECT]: 0,
  };
  return ActivityLog.find(query)
    .then(logs => {
      // Loop through activity log and summarize each day into table.
      const summaryTable = {};
      for (let i = 0; i < logs.length; ++i) {
        const date = moment(logs[i].timestamp).format('YYYY-MM-DD');
        if (!(date in summaryTable)) {
          summaryTable[date] = {};
        }
        const department = logs[i].department;
        if (!(department in summaryTable[date])) {
          summaryTable[date][department] = _.cloneDeep(initialSummary);
        }
        summaryTable[date][department][logs[i].action]++;
      }
      // Reformat to legitimate input for Restful /summaries service.
      const allDateSummaries = [];
      for (const date of Object.keys(summaryTable)) {
        allDateSummaries.push({
          date,
          organization: organizationName,
          by_department: summaryTable[date],
        });
      }
      // Create a promise to update a single daily summary.
      const updateOrCreateOneSummary = (one) =>
        Summary.findOneAndUpdate({ date: one.date, organization: one.organization },
          one, { upsert: true });
      // Utilize the above promise with all daily summaries.
      const updateOrCreateAllSummaries = allDateSummaries.map(updateOrCreateOneSummary);
      return Promise.all(updateOrCreateAllSummaries)
        .then(() => Promise.resolve(hook));
    }).catch(err => {
      throw new Error(err);
    });
};

module.exports = triggerCalculation;
