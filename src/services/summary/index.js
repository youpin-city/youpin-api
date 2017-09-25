const mongoose = require('mongoose');

const Pin = mongoose.model('Pin');

function getSummary(params) {
  const startdate = new Date(params.start_date);
  const enddate = (params.query.enddate ? new Date(params.query.end_date) : new Date());

  const match = {
    $match: {
      created_time: {
        $gte: startdate,
        $lte: enddate,
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
  return Pin.aggregate([match, group, lookup]);
}

module.exports = function () { // eslint-disable-line func-names
  const app = this;

  app.use('/summaries', {
    find(params) {
      return getSummary(params);
    },
  });
  app.service('/summaries');
};
