const mongoose = require('mongoose');
const moment = require('moment');

const Pin = mongoose.model('Pin');

function getSummary(params) {
  const startdate = moment(params.query.start_date);
  const enddate = (params.query.end_date ?
    moment(params.query.end_date).startOf('days').add(1, 'days') :
    moment().startOf('days').add(1, 'days'));

  const match = {
    $match: {
      created_time: {
        $gte: startdate.toDate(),
        $lte: enddate.toDate(),
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
