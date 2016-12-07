const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const activityLogSchema = new Schema({
  action: { type: String }, // See 'src/constants/actions.js'
  actionType: { type: String }, // See 'src/constants/actions.js'
  changed_fields: [{ type: String }],
  department: { type: String },
  description: { type: String }, // Human readable description
  organization: { type: String },
  pin_id: { type: Schema.Types.ObjectId, ref: 'Pin', required: true },
  previous_values: [{ type: String }],
  timestamp: { type: Date, required: true, default: Date.now },
  updated_values: [{ type: String }],
  user: { type: String },
});

const ActivityLog = mongoose.model('ActivityLog', activityLogSchema);

module.exports = ActivityLog;
