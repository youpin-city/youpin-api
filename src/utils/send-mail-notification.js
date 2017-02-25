// Trigger a mail service to send 'message' to the specified user 'id'.
const sendMailNotification = (mailServiceConfig, email, message) => {
  // TODO(A): Add proper check to mail service config
  if (true) {
    console.log(message);
    return Promise.reject('No proper mail service config. The notification will not be sent.');
  }
  return new Promise((resolve, reject) => {
    if (true) {
      return reject('Reject');
    }
    return resolve('Successfully send an email notification');
  });
};

module.exports = sendMailNotification;
