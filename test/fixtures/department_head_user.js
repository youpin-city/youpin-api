const DEPARTMENT_HEAD = require('../../src/constants/roles').DEPARTMENT_HEAD;

module.exports = {
  _id: '579334c75553625d6281b6cc',
  name: 'YouPin Department Head',
  phone: '081-985-2586',
  fb_id: 'youpin_fb_id',
  // hash of 'youpin_admin' password
  password: '$2a$10$iorOMFOPboPeF20W20DKruey2UXXa4eOQSuReOMlxXnqNe5t6Egaq',
  email: 'department_head@youpin.city',
  organization_and_role_pairs: [
    { organization: '579334c74443625d6281b6dd', role: DEPARTMENT_HEAD },
  ],
  organization_and_department_pairs: [
    { organization: '579334c74443625d6281b6dd', department: '57933111556362511181bbb1' },
  ],
  role: DEPARTMENT_HEAD,
};
