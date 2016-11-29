const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const SummarySchema = new Schema({
  organization: { type: String, required: true },
  date: {
    type: String,
    required: true,
    validate: {
      validator: (v) => /\d{4}-\d{2}-\d{2}/.test(v),
      message: '{VALUE} has to be in YYYY-MM-DD format!',
    },
  },
  total_unverified: { type: Number },
  total_verified: { type: Number },
  total_assigned: { type: Number },
  total_processing: { type: Number },
  total_resolved: { type: Number },
  total_rejected: { type: Number },
  by_department: Schema.Types.Mixed,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

SummarySchema.index({ organization: 1, date: 1 }, { unique: true });

const Model = mongoose.model('Summary', SummarySchema);

module.exports = Model;
