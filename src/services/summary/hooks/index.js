const auth = require('feathers-authentication').hooks;

// const modifySearchQuery = require('./modify-search-query');
// const triggerCalculation = require('./trigger-calculation.js');
const validateObjectId = require('../../../utils/hooks/validate-object-id-hook');

const mongoose = require('mongoose');

const Pin = mongoose.model('Pin');

// roles
const {
  EXECUTIVE_ADMIN,
  ORGANIZATION_ADMIN,
  SUPER_ADMIN,
} = require('../../../constants/roles');

function getSummary(hook) {
  const start_date = new Date(hook.params.query.startdate);
  const end_date = (hook.params.query.enddate ? new Date(hook.params.query.enddate) : new Date());

  const match = {
    $match: {
      created_time: {
        $gte: start_date,
        $lte: end_date,
      },
    },
  };
  const group = {
    $group: {
      _id: '$assigned_department',
      total_pending: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
      total_assigned: { $sum: { $cond: [{ $eq: ['$status', 'assigned'] }, 1, 0] } },
      total_processing: { $sum: { $cond: [{ $eq: ['$status', 'processing'] }, 1, 0] } },
      total_rejected: { $sum: { $cond: [{ $eq: ['$status', 'rejected'] }, 1, 0] } },
      total_resolved: { $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] } },
      total_issue: { $sum: 1 },
    },
  };
  const lookup = {
    $lookup: {
      from: 'departments',
      localField: '_id',
      foreignField: '_id',
      as: 'department',
    },
  };
  hook.result = Pin.aggregate([match, group, lookup]);
  return hook;
}

exports.before = {
  all: [],
  find: [
    // triggerCalculation(),
    // modifySearchQuery(),
    // getSummary,
  ],
  get: [validateObjectId()],
  create: [
    auth.verifyToken(),
    auth.populateUser(),
    auth.restrictToRoles({
      roles: [SUPER_ADMIN, ORGANIZATION_ADMIN, EXECUTIVE_ADMIN],
      fieldName: 'role',
    }),
  ],
  update: [
    auth.verifyToken(),
    auth.populateUser(),
    auth.restrictToRoles({
      roles: [SUPER_ADMIN, ORGANIZATION_ADMIN, EXECUTIVE_ADMIN],
      fieldName: 'role',
    }),
  ],
  patch: [
    auth.verifyToken(),
    auth.populateUser(),
    auth.restrictToRoles({
      roles: [SUPER_ADMIN, ORGANIZATION_ADMIN, EXECUTIVE_ADMIN],
      fieldName: 'role',
    }),
  ],
  remove: [
    auth.verifyToken(),
    auth.populateUser(),
    auth.restrictToRoles({
      roles: [SUPER_ADMIN, ORGANIZATION_ADMIN, EXECUTIVE_ADMIN],
      fieldName: 'role',
    }),
  ],
};

exports.after = {
  all: [],
  find: [],
  get: [],
  create: [],
  update: [],
  patch: [],
  remove: [],
};
