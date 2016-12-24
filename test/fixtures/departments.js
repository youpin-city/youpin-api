const ObjectId = require('mongoose').Types.ObjectId;

const ORGANIZATION_ID = require('./constants').ORGANIZATION_ID;
const NORMAL_DEPARTMENT_ID = require('./constants').NORMAL_DEPARTMENT;
const SUPER_ADMIN_DEPARTMENT_ID = require('./constants').SUPER_ADMIN_DEPARTMENT;

module.exports = [
  {
    _id: ObjectId(SUPER_ADMIN_DEPARTMENT_ID), // eslint-disable-line new-cap
    name: 'Admin Department',
    organization: ORGANIZATION_ID,
    detail: 'Admins live here',
  },
  {
    _id: ObjectId(NORMAL_DEPARTMENT_ID), // eslint-disable-line new-cap
    name: 'Department of Nerds',
    organization: ORGANIZATION_ID,
    detail: 'An awesome department',
  },
];
