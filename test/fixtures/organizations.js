const ObjectId = require('mongoose').Types.ObjectId;
const ORGANIZATION_ID = require('./constants').ORGANIZATION_ID;

module.exports = [
  {
    _id: ObjectId(ORGANIZATION_ID), // eslint-disable-line new-cap
    name: 'YouPin',
    // superAdminUser, organizationAdminUser, departmentHeadUser
    users: ['579334c74443625d6281b6ff', '579334c74443625d6281b6dd', '579334c75553625d6281b6cc'],
    detail: 'An awesome organization',
  },
];
