const sendMessage = require('../send-bot-notification');
const sendMail = require('../send-mail-notification');

const User = require('../../services/user/user-model');

// Roles
const ORGANIZATION_ADMIN = require('../../constants/roles').ORGANIZATION_ADMIN;

// Assume that a before hook attach logInfo in proper format already
const sendNotifToRelatedUsers = () => (hook) => {
  // Find all related users' bot ids.
  let relatedUsers = hook.data.toBeNotifiedUsers || [];
  const relatedDepartments = hook.data.toBeNotifiedDepartments || [];
  const relatedRoles = hook.data.toBeNotifiedRoles || [];
  const findUserPromises = [];
  for (let i = 0; i < relatedRoles.length; ++i) {
    // Since organization admin does not have to depend on related department,
    // we can just find it globally.
    if (relatedRoles[i] === ORGANIZATION_ADMIN) {
      findUserPromises.push(User.find({ role: ORGANIZATION_ADMIN }));
    } else {
      // Find users in other roles of related departments.
      findUserPromises.push(
        User.find({ department: { $in: relatedDepartments }, role: relatedRoles[i] }));
    }
  }
  Promise.all(findUserPromises)
    .then(results => {
      // TODO(A): Using correct facebookId (now using fb login's id instead of bot's id.)
      for (let i = 0; i < results.length; ++i) {
        const userList = results[i].map((user) => ({ botId: user.facebookId, email: user.email }));
        relatedUsers = relatedUsers.concat(userList);
      }
      // TODO(A): Add pin owner to relatedUsers list.
      // Use message from logInfo.
      let message = hook.data.logInfo.description;
      // Also, add a link to a pin in issue list.
      const adminConfig = hook.app.get('admin');
      if (adminConfig && adminConfig.adminUrl) {
        message +=
          `\nPin link - ${adminConfig.adminUrl}/issue#!issue-id:${hook.data.logInfo.pin_id}`;
      }
      // Send message to all relatedUsers.
      let allNotificationPromises = [];
      const botConfig = hook.app.get('bot');
      const mailServiceConfig = hook.app.get('mailService');
      if (!botConfig && !mailServiceConfig) {
        throw new Error('No bot/mail config. The notification will not be sent.');
      }
      if (botConfig) {
        const sendMessagePromises = relatedUsers.map((user) =>
          sendMessage(botConfig.botUrl, botConfig.notificationToken, user.botId, message));
        allNotificationPromises = allNotificationPromises.concat(sendMessagePromises);
      }
      if (mailServiceConfig) {
        const sendMailPromises = relatedUsers.map((user) =>
          // TODO(A): Add email notification promise here.
          sendMail(mailServiceConfig, user.email, message));
        allNotificationPromises = allNotificationPromises.concat(sendMailPromises);
      }
      if (allNotificationPromises.length === 0) {
        throw new Error('No legit notification. Nothing will be sent.');
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
