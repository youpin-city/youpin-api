const _ = require('lodash');
const nodemailer = require('nodemailer');
const path = require('path');

const EmailTemplate = require('email-templates').EmailTemplate;
const ObjectId = require('mongoose').Types.ObjectId;

// Model
const Department = require('../services/department/department-model');
const User = require('../services/user/user-model');

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
  const decorateDataFields = (ctx) => new Promise((resolve) => {
    const newPreviousValues = [];
    const newUpdatedValues = [];

    for (const [idx, key] of ctx.changedFields.entries()) {
      let previousValue = ctx.previousValues[idx];
      let updatedValue = ctx.updatedValues[idx];

      switch (key) {
        case 'assigned_department': {
          const extractDepartmentName = (input) => {
            // If it is an object, we will utilise name instead of id.
            if (_.isObject(input) && input.name) {
              return input.name;
            } else if (ObjectId.isValid(input)) {
              // if it is an object id, we query for its name.
              return Department.findById(input)
                .then(obj => (obj ? obj.name : 'Unknown department'));
            }
            // otherwise just return original info.
            return input;
          };
          previousValue = extractDepartmentName(previousValue);
          updatedValue = extractDepartmentName(updatedValue);
          break;
        }
        case 'assigned_users': {
          const extractAssignedUsersName = (input) => {
            // Since assigned_users is an array, it is necessary to use Promise.all
            // to populate all data.
            const mapper = input.map(elem => {
              // If it is an object, we will utilise name instead of id.
              if (_.isObject(elem) && elem.name) {
                return elem.name;
              } else if (ObjectId.isValid(elem)) {
                // if it is an object id, we query for its name.
                return User.findById(elem)
                  .then(obj => (obj ? obj.name : 'Unknown user'));
              }
              // otherwise just return original info.
              return elem;
            });
            return Promise.all(mapper);
          };
          previousValue = extractAssignedUsersName(previousValue);
          updatedValue = extractAssignedUsersName(updatedValue);
          break;
        }
        case 'processed_by': {
          const extractProcessedByName = (input) => {
            // If it is an object, we will utilise name instead of id.
            if (_.isObject(input) && input.name) {
              return input.name;
            } else if (ObjectId.isValid(input)) {
              // if it is an object id, we query for its name.
              return User.findById(input)
                .then(obj => (obj ? obj.name : 'Unknown user'));
            }
            // otherwise just return original info.
            return input;
          };
          previousValue = extractProcessedByName(previousValue);
          updatedValue = extractProcessedByName(updatedValue);
          break;
        }
        default: {
          // Return whatever it is for other fields.
        }
      }
      newPreviousValues.push(previousValue);
      newUpdatedValues.push(updatedValue);
    }
    ctx.previousValues = newPreviousValues; // eslint-disable-line no-param-reassign
    ctx.updatedValues = newUpdatedValues; // eslint-disable-line no-param-reassign
    return Promise.all(ctx.previousValues).then((results) => {
      ctx.previousValues = results; // eslint-disable-line no-param-reassign
      return Promise.all(ctx.updatedValues);
    }).then((results) => {
      ctx.updatedValues = results; // eslint-disable-line no-param-reassign
      resolve(ctx);
    });
  });
  // TODO(A): Send to multiple emails at once and use a better html text format.
  const templateDir = path.join(__dirname, 'email-templates', 'notification');
  const template = new EmailTemplate(templateDir);

  return decorateDataFields(context)
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
