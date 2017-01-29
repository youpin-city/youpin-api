// Trigger bot to send 'message' to the specified user 'id'.
const request = require('superagent');

const sendBotNotification = (id, message) => {
  const app = this;
  const config = app.get('bot');
  if (!config || !config.botUrl || !config.notificationToken) {
    return Promise.reject('No proper bot config. The notification will not be sent.');
  }
  const botUrl = config.botUrl;
  const notifToken = config.notificationToken;
  return new Promise((resolve, reject) => request
    .post(botUrl)
    .query({ NOTIFICATION_TOKEN: notifToken })
    .send({ id: id, message: message })
    .end((err, res) => {
      if (res.status != 200) {
        return reject(`Failed to send notification to Bot:${botUrl} with token:${notifToken}`);
      }
      return resolve(res.body);
    })
  );
};

module.exports = sendBotNotification;
