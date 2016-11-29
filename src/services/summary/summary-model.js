const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const byDepartmentSchema = new Schema({
  department: { type: Schema.Types.ObjectId, ref: 'Department', required: true },
  assigned: { type: Number },
  processing: { type: Number },
  resolved: { type: Number },
  rejected: { type: Number },
});

const summarySchema = new Schema({
  organization: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
  date: {
    type: String,
    required: true,
    unique: true,
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
  by_department: [byDepartmentSchema],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});


summarySchema.pre('find', function preFind(next) {
  this.populate('by_department.department');
  next();
});

const Model = mongoose.model('summary', summarySchema);

module.exports = Model;
