const sendMessage = require('../send-bot-notification');
const sendMail = require('../send-mail-notification');

const User = require('../../services/user/user-model');

// Roles
const ORGANIZATION_ADMIN = require('../../constants/roles').ORGANIZATION_ADMIN;

// Assume that a before hook attach logInfo in proper format already
const sendNotifToRelatedUsers = () => (hook) => { // eslint-disable-line consistent-return
  // Check if no config for both mail/bot, let's just ignore this hook.
  const botConfig = hook.app.get('bot');
  const mailServiceConfig = hook.app.get('mailService');
  if (!botConfig && !mailServiceConfig) {
    console.log('No bot/mail config. The notification will not be sent.');
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
  return Promise.all(findUserPromises)
    .then(results => {
      console.log('1st step in all promises');
      // TODO(A): Using correct facebookId (now using fb login's id instead of bot's id.)
      for (let i = 0; i < results.length; ++i) {
        const userList = results[i].map((user) => ({ botId: user.facebookId, email: user.email }));
        relatedUsers = relatedUsers.concat(userList);
      }
      // TODO(A): Add pin owner to relatedUsers list.
      // Use message from logInfo.
      console.log(hook.data.logInfo);
      if (!hook.data.logInfo || !hook.data.logInfo.description) {
        throw new Error('No description is provided');
      }
      let message = hook.data.logInfo.description;
      // Also, add a link to a pin in issue list.
      const adminConfig = hook.app.get('admin');
      if (adminConfig && adminConfig.adminUrl) {
        message +=
          `\nPin link - ${adminConfig.adminUrl}/issue#!issue-id:${hook.data.logInfo.pin_id}`;
      }
      // Send message to all relatedUsers.
      let allNotificationPromises = [];
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
        console.log('No legit notification. Nothing will be sent.');
        return Promise.resolve([]);
      }
      console.log('Last step - send all notifpromises');
      return Promise.all(allNotificationPromises);
    })
    .then((results) => {
      console.log(`Successfully send notification messages to ${results.length} persons:`);
      let allUsers = '';
      let delim = '';
      for (const user of results) {
        allUsers += delim + user.email;
        delim = ',';
      }
      console.log(allUsers);
      return Promise.resolve(hook);
    }).catch(err => {
      console.log(err);
      throw new Error(err);
    });
};

module.exports = sendNotifToRelatedUsers;
