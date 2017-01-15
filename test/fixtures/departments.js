const ObjectId = require('mongoose').Types.ObjectId;

const DEPARTMENT_GENERAL_ID = require('./constants').DEPARTMENT_GENERAL_ID;
const DEPARTMENT_PUBLIC_RELATIONS_ID = require('./constants').DEPARTMENT_PUBLIC_RELATIONS_ID;
const DEPARTMENT_SUPER_ADMIN_ID = require('./constants').DEPARTMENT_SUPER_ADMIN_ID;

module.exports = [
  {
    _id: ObjectId(DEPARTMENT_SUPER_ADMIN_ID), // eslint-disable-line new-cap
    name: 'Admin Department',
    detail: 'Admins live here',
  },
  {
    _id: ObjectId(DEPARTMENT_GENERAL_ID), // eslint-disable-line new-cap
    name: 'Department of Nerds',
    detail: 'An awesome department',
  },
  {
    _id: ObjectId(DEPARTMENT_PUBLIC_RELATIONS_ID), // eslint-disable-line new-cap
    name: 'Public Relations Department',
    detail: 'PR officers live here',
  },
];
