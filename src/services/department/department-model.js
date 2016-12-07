const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const departmentSchema = new Schema({
  created_time: { type: Date, default: Date.now },
  detail: { type: String },
  name: { type: String, required: true },
  organization: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
  updated_time: { type: Date, default: Date.now },
});

const Department = mongoose.model('Department', departmentSchema);

module.exports = Department;
