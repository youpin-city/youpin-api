const _ = require('lodash');
const nodemailer = require('nodemailer');
const EmailTemplate = require('email-templates').EmailTemplate;
const path = require('path');

// Trigger a mail service to send structural message from 'logInfo'
// to the specified user 'id'.
const sendMailNotification = (mailServiceConfig, issueBaseUrl, email, logInfo) => {
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
    changedFields: logInfo.changed_fields || [],
    previousValues: logInfo.previous_values || [],
    updatedValues: logInfo.updated_values || [],
    message,
  };
  // Extract name field for better & meaningful email content.
  const decorateFieldData = (ctx) => new Promise((resolve) => {
    const newPreviousValues = [];
    const newUpdatedValues = [];
    for (const [idx, key] of ctx.changedFields.entries()) {
      let previousValue = ctx.previousValues[idx];
      let updatedValue = ctx.updatedValues[idx];
      switch (key) {
        case 'processed_by':
        case 'assigned_department':
          // If it is an object, we will utilise name instead of id.
          if (_.isObject(previousValue) && previousValue.name) {
            previousValue = previousValue.name;
          }
          if (_.isObject(updatedValue) && updatedValue.name) {
            updatedValue = updatedValue.name;
          }
          break;
        case 'assigned_users':
          for (let i = 0; i < previousValue.length; i++) {
            // If it is an object, we will utilise name instead of id.
            if (_.isObject(previousValue[i]) && previousValue[i].name) {
              previousValue[i] = previousValue[i].name;
            }
            if (_.isObject(updatedValue[i]) && updatedValue[i].name) {
              updatedValue[i] = updatedValue[i].name;
            }
          }
          break;
        default:
          break;
      }
      newPreviousValues.push(previousValue);
      newUpdatedValues.push(updatedValue);
    }
    ctx.previousValues = newPreviousValues; // eslint-disable-line no-param-reassign
    ctx.updatedValues = newUpdatedValues; // eslint-disable-line no-param-reassign
    resolve(ctx);
  });
  // TODO(A): Send to multiple emails at once and use a better html text format.
  const templateDir = path.join(__dirname, 'email-templates', 'notification');
  const template = new EmailTemplate(templateDir);
  return decorateFieldData(context)
    .then(ctx => template.render(ctx))
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
