const sendMessage = require('../send-bot-notification');

const User = require('../../services/user/user-model');

const DEPARTMENT_HEAD_ROLE = require('../../constants/roles').DEPARTMENT_HEAD;

// Assume that a before hook attach logInfo in proper format already
const sendNotifToRelatedUsers = () => (hook) => {
  // Find all related users' bot ids.
  console.log(hook.data.logInfo);
  let relatedUsers = [];
  const relatedDepartment = hook.data.logInfo.notifyDepartments;
  const findUserPromises = relatedDepartment.map((x) => User.find({ department: x, role: DEPARTMENT_HEAD_ROLE }));
  Promise.all(findUserPromises)
    .then(results => {
      // TODO(A): Using correct facebookId (now using fb login's id instead of bot's id.)
      for (let i = 0; i < results.length; ++i) {
        const fbIdList = results[i].map((x) => x.facebookId);
        relatedUsers = relatedUsers.concat(fbIdList);
      }
      // Use message from logInfo.
      const message = hook.data.logInfo.description;
      // Send message to all relatedUsers.
      // Temporarily using just A's bot id to test on Production.
      relatedUsers = ['1196091530439153'];
      const botConfig = hook.app.get('bot');
      if (!botConfig) {
        throw new Error('No bot config. The notification will not be sent.');
      }
      const sendMessagePromises = relatedUsers.map(
        (x) => sendMessage(botConfig.botUrl, botConfig.notificationToken, x, message));
      return Promise.all(sendMessagePromises);
    })
    .then((results) => {
      console.log(`Successfully send notification messages to Bot - ${results}`);
    })
    .catch(err => {
      console.log(err);
      throw new Error(err);
    });
};

module.exports = sendNotifToRelatedUsers;
