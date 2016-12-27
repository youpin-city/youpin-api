const ObjectId = require('mongoose').Types.ObjectId;

const DEPARTMENT_GENERAL_ID = require('./constants').DEPARTMENT_GENERAL_ID;
const ORGANIZATION_ID = require('./constants').ORGANIZATION_ID;
const PIN_ASSIGNED_ID = require('./constants').PIN_ASSIGNED_ID;
const PIN_ASSIGNED_DETAIL = require('./constants').PIN_ASSIGNED_DETAIL;
const PIN_DEPARTMENT_UNASSIGNED_ID = require('./constants').PIN_DEPARTMENT_UNASSIGNED_ID;
const PIN_DEPARTMENT_UNASSIGNED_DETAIL = require('./constants').PIN_DEPARTMENT_UNASSIGNED_DETAIL;
const PIN_UNVERIFIED_ID = require('./constants').PIN_UNVERIFIED_ID;
const PIN_UNVERIFIED_DETAIL = require('./constants').PIN_UNVERIFIED_DETAIL;
const PIN_VERIFIED_ID = require('./constants').PIN_VERIFIED_ID;
const PIN_VERIFIED_DETAIL = require('./constants').PIN_VERIFIED_DETAIL;

module.exports = [
  {
    _id: ObjectId(PIN_UNVERIFIED_ID), // eslint-disable-line new-cap
    assigned_department: DEPARTMENT_GENERAL_ID, // department ObjectId
    created_time: '2016-12-01',
    detail: PIN_UNVERIFIED_DETAIL,
    organization: ORGANIZATION_ID, // organization ObjectId
    owner: '579334c75563625d6281b6f1', // adminUser ObjectId
    provider: '579334c75563625d6281b6f1', // adminUser ObjectId
    location: {
      coordinates: [100.56983534303, 13.730537951109],
    },
    status: 'unverified',
    is_archived: false,
  },
  {
    _id: ObjectId(PIN_VERIFIED_ID), // eslint-disable-line new-cap
    assigned_department: '57933111556362511181ccc1', // department ObjectId
    created_time: '2016-12-05',
    detail: PIN_VERIFIED_DETAIL,
    organization: ORGANIZATION_ID, // organization ObjectId
    owner: '579334c75563625d6281b6f1', // adminUser ObjectId
    provider: '579334c75563625d6281b6f1', // adminUser ObjectId
    location: {
      coordinates: [100.56983534304, 13.730537951108],
    },
    status: 'verified',
    is_archived: false,
  },
  {
    _id: ObjectId(PIN_ASSIGNED_ID), // eslint-disable-line new-cap
    assigned_department: DEPARTMENT_GENERAL_ID, // department ObjectId
    created_time: '2016-12-03',
    detail: PIN_ASSIGNED_DETAIL,
    organization: ORGANIZATION_ID, // organization ObjectId
    owner: '579334c75563625d6281b6f1', // adminUser ObjectId
    provider: '579334c75563625d6281b6f1', // adminUser ObjectId
    location: {
      coordinates: [100.56983534305, 13.730537951107],
    },
    status: 'assigned',
    is_archived: false,
  },
  {
    _id: ObjectId(PIN_DEPARTMENT_UNASSIGNED_ID), // eslint-disable-line new-cap
    created_time: '2016-12-03',
    detail: PIN_DEPARTMENT_UNASSIGNED_DETAIL,
    organization: ORGANIZATION_ID, // organization ObjectId
    owner: '579334c75563625d6281b6f1', // adminUser ObjectId
    provider: '579334c75563625d6281b6f1', // adminUser ObjectId
    location: {
      coordinates: [100.56983534305, 13.730537951107],
    },
    status: 'unverified',
    is_archived: false,
  },
];
