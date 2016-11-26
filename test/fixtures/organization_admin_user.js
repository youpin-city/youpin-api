const ORGANIZATION_ADMIN = require('../../src/constants/roles').ORGANIZATION_ADMIN;

module.exports = {
  _id: '579334c74443625d6281b6dd',
  name: 'YouPin Organization Admin',
  phone: '081-985-2586',
  fb_id: 'youpin_fb_id',
  // hash of 'youpin_admin' password
  password: '$2a$10$iorOMFOPboPeF20W20DKruey2UXXa4eOQSuReOMlxXnqNe5t6Egaq',
  email: 'organization_admin@youpin.city',
  organization_and_role_pairs: [
    { organization: '579334c74443625d6281b6dd', role: ORGANIZATION_ADMIN },
  ],
  organization_and_department_pairs: [
    { organization: '579334c74443625d6281b6dd', department: '57933111556362511181ccc1' },
  ],
  role: ORGANIZATION_ADMIN,
};
