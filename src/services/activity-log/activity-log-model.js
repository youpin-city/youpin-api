const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const ActivityLogSchema = new Schema({
  user: { type: String },
  department: { type: String },
  organization: { type: String },
  actionType: { type: String }, // See 'src/constants/actions.js'
  action: { type: String }, // See 'src/constants/actions.js'
  pin_id: { type: Schema.Types.ObjectId, ref: 'Pin', required: true },
  changed_fields: [{ type: String }],
  previous_values: [{ type: String }],
  updated_values: [{ type: String }],
  description: { type: String }, // Human readable description
  timestamp: { type: Date, required: true, default: Date.now },
});

const ActivityLogModel = mongoose.model('ActivityLog', ActivityLogSchema);

module.exports = ActivityLogModel;
