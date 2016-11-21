// department-model.js - A mongoose model
//
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.

const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const departmentSchema = new Schema({
  name: { type: String, required: true },
  organization: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
  detail: { type: String },
  created_time: { type: Date, default: Date.now },
  updated_time: { type: Date, default: Date.now },
});

const departmentModel = mongoose.model('Department', departmentSchema);

module.exports = departmentModel;
