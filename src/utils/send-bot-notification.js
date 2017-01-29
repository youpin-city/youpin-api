// Trigger bot to send 'message' to the specified user 'id'.
const request = require('superagent');

const sendBotNotification = (botUrl, notificationToken, id, message) => {
  if (!botUrl || !notificationToken) {
    return Promise.reject('No proper bot config. The notification will not be sent.');
  }
  return new Promise((resolve, reject) => request
    .post(botUrl)
    .query({ NOTIFICATION_TOKEN: notificationToken })
    .send({ id, message })
    .end((err, res) => {
      if (err) {
        return reject(err);
      }
      if (res.status !== 200) {
        return reject(
          `Failed to send notification to Bot:${botUrl} with token:${notificationToken}`);
      }
      return resolve(res.body);
    })
  );
};

module.exports = sendBotNotification;
