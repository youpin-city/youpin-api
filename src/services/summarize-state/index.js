const _ = require('lodash');
const hooks = require('./hooks');

const pinStates = require('../../constants/pin-states');

// Models
const Pin = require('../pin/pin-model');

class Service {
  constructor(options) {
    this.options = options || {};
  }

  find(params) {
    const startDate = params.query.start_date;
    const endDate = params.query.end_date;
    if (!startDate || !endDate) {
      return Promise.reject(new Error('Please specified both start_date and end_date'));
    }
    // TODO(parnurzeal): Support multiple organizations. Currently, we are focusing
    // solely on having just one organization per YouPin system.
    // Put params into a mongoose query format.
    const query = {
      created_time: {
        $gte: startDate,
        $lte: endDate,
      },
    };
    // Find pins that belong to the organization
    return Pin.find(query).select('status assigned_department assigned_users')
      .then(populatedPins => {
        // Initialise summary with zeros.
        const initialSummary = {
          [pinStates.PENDING]: 0,
          [pinStates.ASSIGNED]: 0,
          [pinStates.PROCESSING]: 0,
          [pinStates.RESOLVED]: 0,
          [pinStates.REJECTED]: 0,
        };
        // Summarize all pins into a table of department-states
        const summaryTable = {};
        for (let i = 0; i < populatedPins.length; ++i) {
          const department = populatedPins[i].assigned_department;
          const pinStatus = populatedPins[i].status;
          let departmentName = 'None';
          if (department) {
            departmentName = department.name;
          }
          if (!(departmentName in summaryTable)) {
            summaryTable[departmentName] = { total: _.cloneDeep(initialSummary) };
          }
          summaryTable[departmentName].total[pinStatus]++;

          // Also populate summary table for each assigned user.
          let assignedUsers = populatedPins[i].assigned_users;
          if (assignedUsers.length === 0) {
            // Assign to 'unassigned' user if pin is not assigned to anyone.
            assignedUsers = [{ name: 'unassigned' }];
          }
          for (let j = 0; j < assignedUsers.length; ++j) {
            const userName = assignedUsers[j].name;
            if (!(userName in summaryTable[departmentName])) {
              summaryTable[departmentName][userName] = _.cloneDeep(initialSummary);
            }
            summaryTable[departmentName][userName][pinStatus]++;
          }
        }
        return Promise.resolve(summaryTable);
      })
      .catch(err => Promise.reject(new Error(err)));
  }
}

module.exports = function () { // eslint-disable-line func-names
  const app = this;
  app.use('/summarize-states', new Service());
  const summarizeStateService = app.service('/summarize-states');
  summarizeStateService.before(hooks.before);
  summarizeStateService.after(hooks.after);
};

module.exports.Service = Service;
