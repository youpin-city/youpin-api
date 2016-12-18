const USER = require('../../src/constants/roles').USER;

module.exports = {
  _id: '579334c74443625d6281b699',
  name: 'YouPin Normal User',
  phone: '081-111-1111',
  fb_id: 'youpin_fb_id',
  // hash of 'youpin_user' password
  password: '$2a$10$VnzRyMnaSHEBwuHHc0TT8OJsmDjUoHUtJ2WydUbvHQbDQ0Okr.GvG',
  email: 'user@youpin.city',
  organization_and_role_pairs: [
    { organization: '579334c74443625d6281b6dd', role: USER },
  ],
  organization_and_department_pairs: [
    { organization: '579334c74443625d6281b6dd', department: '57933111556362511181bbb1' },
  ],
  role: USER,
};
