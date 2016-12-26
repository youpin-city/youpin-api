const ObjectId = require('mongoose').Types.ObjectId;

const DEPARTMENT_SUPER_ADMIN_ID = require('./constants').DEPARTMENT_SUPER_ADMIN_ID;
const USER_ADMIN_ID = require('./constants').USER_ADMIN_ID;

module.exports = {
  _id: ObjectId(USER_ADMIN_ID), // eslint-disable-line new-cap
  name: 'YouPin Admin',
  phone: '081-985-2586',
  fb_id: 'youpin_fb_id',
  // hash of 'youpin_admin' password
  password: '$2a$10$iorOMFOPboPeF20W20DKruey2UXXa4eOQSuReOMlxXnqNe5t6Egaq',
  email: 'contact@youpin.city',
  department: ObjectId(DEPARTMENT_SUPER_ADMIN_ID), // eslint-disable-line new-cap
  role: 'super_admin',
};
