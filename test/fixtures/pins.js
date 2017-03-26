const ObjectId = require('mongoose').Types.ObjectId;

const DEPARTMENT_GENERAL_ID = require('./constants').DEPARTMENT_GENERAL_ID;
const DEPARTMENT_SUPER_ADMIN_ID = require('./constants').DEPARTMENT_SUPER_ADMIN_ID;
const ORGANIZATION_ID = require('./constants').ORGANIZATION_ID;
const PIN_ASSIGNED_ID = require('./constants').PIN_ASSIGNED_ID;
const PIN_ASSIGNED_DETAIL = require('./constants').PIN_ASSIGNED_DETAIL;
const PIN_PENDING_ID = require('./constants').PIN_PENDING_ID;
const PIN_PENDING_DETAIL = require('./constants').PIN_PENDING_DETAIL;
const PIN_PROCESSING_ID = require('./constants').PIN_PROCESSING_ID;
const PIN_PROCESSING_DETAIL = require('./constants').PIN_PROCESSING_DETAIL;
const USER_DEPARTMENT_HEAD_ID = require('./constants').USER_DEPARTMENT_HEAD_ID;

module.exports = [
  {
    _id: ObjectId(PIN_PENDING_ID), // eslint-disable-line new-cap
    created_time: '2016-12-01',
    detail: PIN_PENDING_DETAIL,
    organization: ORGANIZATION_ID, // organization ObjectId
    owner: '579334c75563625d6281b6f1', // adminUser ObjectId
    provider: '579334c75563625d6281b6f1', // adminUser ObjectId
    location: {
      coordinates: [100.56983534303, 13.730537951109],
    },
    status: 'pending',
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
    assigned_users: [USER_DEPARTMENT_HEAD_ID],
    status: 'assigned',
    is_archived: false,
  },
  {
    _id: ObjectId(PIN_PROCESSING_ID), // eslint-disable-line new-cap
    assigned_department: DEPARTMENT_SUPER_ADMIN_ID, // department ObjectId
    created_time: '2016-12-03',
    detail: PIN_PROCESSING_DETAIL,
    organization: ORGANIZATION_ID, // organization ObjectId
    owner: '579334c75563625d6281b6f1', // adminUser ObjectId
    provider: '579334c75563625d6281b6f1', // adminUser ObjectId
    location: {
      coordinates: [100.56983534305, 13.730537951107],
    },
    assigned_users: [USER_DEPARTMENT_HEAD_ID],
    status: 'processing',
    is_archived: false,
  },
];
