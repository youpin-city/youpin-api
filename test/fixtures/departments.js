const ObjectId = require('mongoose').Types.ObjectId;

const DEPARTMENT_GENERAL_ID = require('./constants').DEPARTMENT_GENERAL_ID;
const DEPARTMENT_SUPER_ADMIN_ID = require('./constants').DEPARTMENT_SUPER_ADMIN_ID;
const ORGANIZATION_ID = require('./constants').ORGANIZATION_ID;

module.exports = [
  {
    _id: ObjectId(DEPARTMENT_SUPER_ADMIN_ID), // eslint-disable-line new-cap
    name: 'Admin Department',
    organization: ORGANIZATION_ID,
    detail: 'Admins live here',
  },
  {
    _id: ObjectId(DEPARTMENT_GENERAL_ID), // eslint-disable-line new-cap
    name: 'Department of Nerds',
    organization: ORGANIZATION_ID,
    detail: 'An awesome department',
  },
];
