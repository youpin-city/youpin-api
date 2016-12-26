const ObjectId = require('mongoose').Types.ObjectId;

const DEPARTMENT_ORGANIZATION_ADMIN_ID = require('./constants').DEPARTMENT_ORGANIZATION_ADMIN_ID;
const ORGANIZATION_ADMIN = require('../../src/constants/roles').ORGANIZATION_ADMIN;
const USER_ORGANIZATION_ADMIN_ID = require('./constants').USER_ORGANIZATION_ADMIN_ID;

module.exports = {
  _id: ObjectId(USER_ORGANIZATION_ADMIN_ID), // eslint-disable-line new-cap
  name: 'YouPin Organization Admin',
  phone: '081-985-2586',
  fb_id: 'youpin_fb_id',
  // hash of 'youpin_admin' password
  password: '$2a$10$iorOMFOPboPeF20W20DKruey2UXXa4eOQSuReOMlxXnqNe5t6Egaq',
  email: 'organization_admin@youpin.city',
  department: ObjectId(DEPARTMENT_ORGANIZATION_ADMIN_ID), // eslint-disable-line new-cap
  role: ORGANIZATION_ADMIN,
};
