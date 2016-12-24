const ObjectId = require('mongoose').Types.ObjectId;

const ORGANIZATION_ID = require('./constants').ORGANIZATION_ID;
const NORMAL_DEPARTMENT_ID = require('./constants').NORMAL_DEPARTMENT_ID;
const ASSIGNED_PIN_ID = require('./constants').ASSIGNED_PIN_ID;
const ASSIGNED_PIN_DETAIL = require('./constants').ASSIGNED_PIN_DETAIL;
const UNVERIFIED_PIN_ID = require('./constants').UNVERIFIED_PIN_ID;
const UNVERIFIED_PIN_DETAIL = require('./constants').UNVERIFIED_PIN_DETAIL;
const VERIFIED_PIN_ID = require('./constants').VERIFIED_PIN_ID;
const VERIFIED_PIN_DETAIL = require('./constants').VERIFIED_PIN_DETAIL;

module.exports = [
  {
    _id: ObjectId(UNVERIFIED_PIN_ID), // eslint-disable-line new-cap
    assigned_department: NORMAL_DEPARTMENT_ID, // department ObjectId
    created_time: '2016-12-01',
    detail: UNVERIFIED_PIN_DETAIL,
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
    _id: ObjectId(VERIFIED_PIN_ID), // eslint-disable-line new-cap
    assigned_department: '57933111556362511181ccc1', // department ObjectId
    created_time: '2016-12-05',
    detail: VERIFIED_PIN_DETAIL,
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
    _id: ObjectId(ASSIGNED_PIN_ID), // eslint-disable-line new-cap
    assigned_department: NORMAL_DEPARTMENT_ID, // department ObjectId
    created_time: '2016-12-03',
    detail: ASSIGNED_PIN_DETAIL,
    organization: ORGANIZATION_ID, // organization ObjectId
    owner: '579334c75563625d6281b6f1', // adminUser ObjectId
    provider: '579334c75563625d6281b6f1', // adminUser ObjectId
    location: {
      coordinates: [100.56983534305, 13.730537951107],
    },
    status: 'assigned',
    is_archived: false,
  },
];
