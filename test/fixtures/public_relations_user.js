const DEPARTMENT_PUBLIC_RELATIONS_ID = require('./constants').DEPARTMENT_PUBLIC_RELATIONS_ID;
const USER_PUBLIC_RELATIONS_ID = require('./constants').USER_PUBLIC_RELATIONS_ID;
// roles
const PUBLIC_RELATIONS = require('../../src/constants/roles').PUBLIC_RELATIONS;

module.exports = {
  _id: USER_PUBLIC_RELATIONS_ID,
  name: 'YouPin Public Relations',
  phone: '081-985-2586',
  fb_id: 'youpin_fb_id',
  // hash of 'youpin_public_relations' password
  password: '$2a$10$wtr6UJqzMRDbe5e6xypVrecxM8jtSIdD4pw8hf6QEPEAMUV1ctH/a',
  email: 'public_relations@youpin.city',
  department: DEPARTMENT_PUBLIC_RELATIONS_ID,
  role: PUBLIC_RELATIONS,
};
