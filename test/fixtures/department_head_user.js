const ObjectId = require('mongoose').Types.ObjectId;

const DEPARTMENT_HEAD = require('../../src/constants/roles').DEPARTMENT_HEAD;
const DEPARTMENT_GENERAL_ID = require('./constants').DEPARTMENT_GENERAL_ID;

module.exports = {
  _id: '579334c75553625d6281b6cc',
  name: 'YouPin Department Head',
  phone: '081-985-2586',
  fb_id: 'youpin_fb_id',
  // hash of 'youpin_admin' password
  password: '$2a$10$iorOMFOPboPeF20W20DKruey2UXXa4eOQSuReOMlxXnqNe5t6Egaq',
  email: 'department_head@youpin.city',
  department: ObjectId(DEPARTMENT_GENERAL_ID), // eslint-disable-line new-cap
  role: DEPARTMENT_HEAD,
};
