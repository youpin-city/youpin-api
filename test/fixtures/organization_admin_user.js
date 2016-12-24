const ObjectId = require('mongoose').Types.ObjectId;

const ORGANIZATION_ADMIN = require('../../src/constants/roles').ORGANIZATION_ADMIN;
const ORGANIZATION_ADMIN_DEPARTMENT_ID = require('./constants').ORGANIZATION_ADMIN_DEPARTMENT_ID;
const ORGANIZATION_ADMIN_USER_ID = require('./constants').ORGANIZATION_ADMIN_USER_ID;

module.exports = {
  _id: ObjectId(ORGANIZATION_ADMIN_USER_ID), // eslint-disable-line new-cap
  name: 'YouPin Organization Admin',
  phone: '081-985-2586',
  fb_id: 'youpin_fb_id',
  // hash of 'youpin_admin' password
  password: '$2a$10$iorOMFOPboPeF20W20DKruey2UXXa4eOQSuReOMlxXnqNe5t6Egaq',
  email: 'organization_admin@youpin.city',
  departments: [ORGANIZATION_ADMIN_DEPARTMENT_ID],
  role: ORGANIZATION_ADMIN,
};
