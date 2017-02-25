const sendMessage = require('../send-bot-notification');
const sendMail = require('../send-mail-notification');

const User = require('../../services/user/user-model');

const DEPARTMENT_HEAD_ROLE = require('../../constants/roles').DEPARTMENT_HEAD;

// Assume that a before hook attach logInfo in proper format already
const sendNotifToRelatedUsers = () => (hook) => {
  // Find all related users' bot ids.
  let relatedUsers = [];
  const relatedDepartments = hook.data.logInfo.toBeNotifiedDepartments;
  const findUserPromises = relatedDepartments.map(
    (department) => User.find({ department, role: DEPARTMENT_HEAD_ROLE }));
  Promise.all(findUserPromises)
    .then(results => {
      // TODO(A): Using correct facebookId (now using fb login's id instead of bot's id.)
      for (let i = 0; i < results.length; ++i) {
        const userList = results[i].map((user) => ({ botId: user.facebookId, email: user.email }));
        relatedUsers = relatedUsers.concat(userList);
      }
      // TODO(A): Add assigned_user (toBeNotifiedUsers) & pin owner to relatedUsers list.
      // Use message from logInfo.
      const message = hook.data.logInfo.description;
      // Send message to all relatedUsers.
      // Temporarily using just A's bot id to test on Production.
      // TODO(A): Remove it after we can have bot id for other users.
      relatedUsers = [{ botId: '1196091530439153', email: 'theeraphol.wat@gmail.com' }];
      const allNotificationPromises = [];
      const botConfig = hook.app.get('bot');
      if (botConfig) {
        const sendMessagePromises = relatedUsers.map((user) =>
          sendMessage(botConfig.botUrl, botConfig.notificationToken, user.botId, message));
        allNotificationPromises.concat(sendMessagePromises);
      }
      const mailServiceConfig = hook.app.get('mailService');
      if (mailServiceConfig) {
        const sendMailPromises = relatedUsers.map((user) =>
          // TODO(A): Add email notification promise here.
          sendMail(mailServiceConfig, user.email, message));
        allNotificationPromises.concat(sendMailPromises);
      }
      if (allNotificationPromises.length === 0) {
        throw new Error('No bot/mail config. The notification will not be sent.');
      }
      return Promise.all(allNotificationPromises);
    })
    .then((results) => {
      console.log(`Successfully send notification messages - ${results}`);
    })
    .catch(err => {
      console.log(err);
      throw new Error(err);
    });
};

module.exports = sendNotifToRelatedUsers;
