const sendMessage = require('../send-bot-notification');

const User = require('../../services/user/user-model');

const DEPARTMENT_HEAD_ROLE = require('../../constants/roles').DEPARTMENT_HEAD;

//
// Assume that a before hook attach logInfo in proper format already
const sendNotifToRelatedUsers = () => (hook) => {
  // Find all related users' bot ids.
  console.log(hook.data.logInfo);
  let relatedUsers = [];
  const relatedDepartment = hook.data.logInfo.notifyDepartments;
  const findUserPromises = relatedDepartment.map((x) => {
    console.log({department: x, role: DEPARTMENT_HEAD_ROLE});
    return User.find({ department: x, role: DEPARTMENT_HEAD_ROLE})
  });
  Promise.all(findUserPromises)
    .then(results => {
      console.log(results[0].data);
    })
    .catch(error => {
      console.log(error);
    });
  //const prevDepartment =
};

module.exports = sendNotifToRelatedUsers;
