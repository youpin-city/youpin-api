const nodemailer = require('nodemailer');
const EmailTemplate = require('email-templates').EmailTemplate;
const path = require('path');

// Trigger a mail service to send structural message from 'logInfo'
// to the specified user 'id'.
const sendMailNotification = (mailServiceConfig, issueBaseUrl, email, logInfo) => {
  // TODO(A): Add proper check to mail service config
  if (!mailServiceConfig.providerConfig
      || !mailServiceConfig.content
      || !mailServiceConfig.content.title
      || !mailServiceConfig.content.logoUrl
      || !issueBaseUrl) {
    return Promise.reject('No proper mail service config. The notification will not be sent.');
  }
  // Only send mail during test if a user forces it.
  if (process.env.NODE_ENV === 'test' && process.env.TEST_MAIL_NOTIF !== 'true') {
    return Promise.reject('To send mail during testing, please set TEST_MAIL_NOTIF=true.');
  }
  const transporter = nodemailer.createTransport(mailServiceConfig.providerConfig);
  const message = logInfo.description;
  const fixedContent = mailServiceConfig.content;
  const context = {
    title: fixedContent.title,
    logoUrl: fixedContent.logoUrl,
    pinLink: `${issueBaseUrl}${logInfo.pin_id}`,
    message,
  };
  // TODO(A): Send to multiple emails at once and use a better html text format.
  const templateDir = path.join(__dirname, 'email-templates', 'notification');
  const template = new EmailTemplate(templateDir);
  return template
    .render(context)
    .then(result => {
      const mailOptions = {
        from: mailServiceConfig.content.from,
        to: email,
        subject: fixedContent.title,
        text: result.text,
        html: result.html,
      };
      return new Promise((resolve, reject) => {
        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            return reject(error);
          }
          return resolve(info);
        });
      });
    });
};

module.exports = sendMailNotification;
