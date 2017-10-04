const ObjectId = require('mongoose').Types.ObjectId;

const state = require('../../src/constants/pin-states');
const DEPARTMENT_GENERAL_ID = require('./constants').DEPARTMENT_GENERAL_ID;
const DEPARTMENT_SUPER_ADMIN_ID = require('./constants').DEPARTMENT_SUPER_ADMIN_ID;
const ORGANIZATION_ID = require('./constants').ORGANIZATION_ID;
const PIN_ASSIGNED_ID = require('./constants').PIN_ASSIGNED_ID;
const PIN_ASSIGNED_DETAIL = require('./constants').PIN_ASSIGNED_DETAIL;
const PIN_PENDING_ID = require('./constants').PIN_PENDING_ID;
const PIN_PENDING_DETAIL = require('./constants').PIN_PENDING_DETAIL;
const PIN_PROCESSING_ID = require('./constants').PIN_PROCESSING_ID;
const PIN_PROCESSING_DETAIL = require('./constants').PIN_PROCESSING_DETAIL;
const PIN_RESOLVED_ID = require('./constants').PIN_RESOLVED_ID;
const PIN_RESOLVED_DETAIL = require('./constants').PIN_RESOLVED_DETAIL;
const PIN_REJECTED_ID = require('./constants').PIN_REJECTED_ID;
const PIN_REJECTED_DETAIL = require('./constants').PIN_REJECTED_DETAIL;
const PROGRESS_DETAIL = require('./constants').PROGRESS_DETAIL;
const USER_ADMIN_ID = require('./constants').USER_ADMIN_ID;
const USER_DEPARTMENT_HEAD_ID = require('./constants').USER_DEPARTMENT_HEAD_ID;

module.exports = [
  {
    _id: ObjectId(PIN_PENDING_ID), // eslint-disable-line new-cap
    created_time: '2016-12-01',
    detail: PIN_PENDING_DETAIL,
    organization: ORGANIZATION_ID, // organization ObjectId
    owner: USER_ADMIN_ID, // adminUser ObjectId
    provider: USER_ADMIN_ID, // adminUser ObjectId
    location: {
      type: 'Point',
      coordinates: [100.56983534303, 13.730537951109],
    },
    status: state.PENDING,
    is_archived: false,
  },
  {
    _id: ObjectId(PIN_ASSIGNED_ID), // eslint-disable-line new-cap
    assigned_department: DEPARTMENT_GENERAL_ID, // department ObjectId
    assigned_time: '2015-12-04',
    created_time: '2016-12-03',
    detail: PIN_ASSIGNED_DETAIL,
    organization: ORGANIZATION_ID, // organization ObjectId
    owner: USER_ADMIN_ID, // adminUser ObjectId
    provider: USER_ADMIN_ID, // adminUser ObjectId
    location: {
      type: 'Point',
      coordinates: [100.56983534305, 13.730537951107],
    },
    assigned_users: [USER_DEPARTMENT_HEAD_ID],
    status: state.ASSIGNED,
    is_archived: false,
  },
  {
    _id: ObjectId(PIN_PROCESSING_ID), // eslint-disable-line new-cap
    assigned_department: DEPARTMENT_SUPER_ADMIN_ID, // department ObjectId
    assigned_time: '2015-12-04',
    created_time: '2016-12-03',
    detail: PIN_PROCESSING_DETAIL,
    organization: ORGANIZATION_ID, // organization ObjectId
    owner: USER_ADMIN_ID, // adminUser ObjectId
    provider: USER_ADMIN_ID, // adminUser ObjectId
    location: {
      type: 'Point',
      coordinates: [100.56983534305, 13.730537951107],
    },
    processing_time: '2015-12-04',
    progresses: [
      {
        created_time: '2016-12-04',
        owner: USER_ADMIN_ID, // adminUser ObjectId
        detail: PROGRESS_DETAIL,
      },
    ],
    assigned_users: [USER_DEPARTMENT_HEAD_ID],
    status: state.PROCESSING,
    is_archived: false,
  },
  {
    _id: ObjectId(PIN_RESOLVED_ID), // eslint-disable-line new-cap
    assigned_department: DEPARTMENT_SUPER_ADMIN_ID, // department ObjectId
    assigned_time: '2015-12-04',
    created_time: '2016-12-03',
    detail: PIN_RESOLVED_DETAIL,
    organization: ORGANIZATION_ID, // organization ObjectId
    owner: USER_ADMIN_ID, // adminUser ObjectId
    provider: USER_ADMIN_ID, // adminUser ObjectId
    location: {
      type: 'Point',
      coordinates: [100.56983534305, 13.730537951107],
    },
    processing_time: '2015-12-04',
    progresses: [
      {
        created_time: '2016-12-03',
        owner: USER_ADMIN_ID, // adminUser ObjectId
        detail: PROGRESS_DETAIL,
      },
    ],
    assigned_users: [USER_DEPARTMENT_HEAD_ID],
    status: state.RESOLVED,
    resolved_time: '2016-12-04',
    is_archived: false,
  },
  {
    _id: ObjectId(PIN_REJECTED_ID), // eslint-disable-line new-cap
    created_time: '2016-12-03',
    detail: PIN_REJECTED_DETAIL,
    organization: ORGANIZATION_ID, // organization ObjectId
    owner: USER_ADMIN_ID, // adminUser ObjectId
    provider: USER_ADMIN_ID, // adminUser ObjectId
    location: {
      type: 'Point',
      coordinates: [100.56983534305, 13.730537951107],
    },
    status: state.REJECTED,
    rejected_time: '2016-12-04',
    is_archived: false,
  },
];
