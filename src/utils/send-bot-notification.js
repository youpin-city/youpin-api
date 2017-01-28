// Trigger bot to send 'message' to the specified user 'id'.
const NOTIFICATION_TOKEN = app.get('bot').notificationToken;
const BOT_URL = app.get('bot').botUrl;

const request = require('superagent');

const sendBotNotification = (id, message) => {
  const app = this;
  const config = app.get('bot');
  if (!config || !config.botUrl || !config.notificationToken) {
    console.log('No proper bot config. The notification will not be sent.');
  }
  const botUrl = config.botUrl;
  const notifToken = config.notificationToken;
  request
    .post(botUrl)
    .query({ NOTIFICATION_TOKEN: notifToken })
    .send({ id: id, message: message })
    .end((err, res) => {
      if (res.status != 200) {
        console.log(`Failed to send notification to Bot:${botUrl} with token:${notifToken}`);
        return;
      }
      console.log('Successfully sending notification to Bot.');
    })
};

module.exports = sendBotNotification;
