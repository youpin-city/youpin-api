const sendMessage = require('../send-bot-notification');
const sendMail = require('../send-mail-notification');

const User = require('../../services/user/user-model');

// Roles
const ORGANIZATION_ADMIN = require('../../constants/roles').ORGANIZATION_ADMIN;

// Assume that a before hook attach logInfo in proper format already
const sendNotifToRelatedUsers = () => (hook) => { // eslint-disable-line consistent-return
  // If no bot/mail config, just ignore this hook entirely.
  const botConfig = hook.app.get('bot');
  const mailServiceConfig = hook.app.get('mailService');
  if (!botConfig && !mailServiceConfig) {
    console.log('No bot/mail config. The notification will not be sent.');
    return hook;
  }
  if (!hook.data.logInfo || !hook.data.logInfo.description) {
    console.log('No proper loginfo. The notification will not be sent.');
    return hook;
  }
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
      if (adminConfig && adminConfig.adminUrl && hook.data.logInfo.pin_id) {
        message +=
          `\nPin link - ${adminConfig.adminUrl}/issue#!issue-id:${hook.data.logInfo.pin_id}`;
      }
      // Send message to all relatedUsers.
      const allNotificationPromises = [];
      for (let i = 0; i < relatedUsers.length; ++i) {
        const user = relatedUsers[i];
        if (botConfig && botConfig.botUrl && botConfig.notificationToken && user.botId) {
          allNotificationPromises.push(
            sendMessage(botConfig.botUrl, botConfig.notificationToken, user.botId, message));
        }
        if (mailServiceConfig && user.email) {
          allNotificationPromises.push(sendMail(mailServiceConfig, user.email, message));
        }
      }
      // TODO(A): Remove after ensuring the notif works fine.
      // This is for only testing in PROD to monitor that every notif mail has come.
      if (mailServiceConfig) {
        allNotificationPromises.push(sendMail(mailServiceConfig, 'parnurzeal@gmail.com', message));
      }
      if (allNotificationPromises.length === 0) {
        console.log('No legit notification. Nothing will be sent.');
        return [];
      }
      return Promise.all(allNotificationPromises);
    })
    .then((results) => {
      console.log('Successfully send notification messages -');
      console.log(results);
    })
    .catch(error => {
      console.log(error);
    });
};

module.exports = sendNotifToRelatedUsers;
