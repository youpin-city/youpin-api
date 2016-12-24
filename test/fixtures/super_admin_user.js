const SUPER_ADMIN_USER_ID = require('./constants').SUPER_ADMIN_USER_ID;
const SUPER_ADMIN_DEPARTMENT_ID = require('./constants').SUPER_ADMIN_DEPARTMENT_ID;
const SUPER_ADMIN = require('../../src/constants/roles').SUPER_ADMIN;

module.exports = {
  _id: SUPER_ADMIN_USER_ID,
  name: 'YouPin Super Admin',
  phone: '081-985-2586',
  fb_id: 'youpin_fb_id',
  // hash of 'youpin_admin' password
  password: '$2a$10$iorOMFOPboPeF20W20DKruey2UXXa4eOQSuReOMlxXnqNe5t6Egaq',
  email: 'super_admin@youpin.city',
  departments: [SUPER_ADMIN_DEPARTMENT_ID],
  role: SUPER_ADMIN,
};
