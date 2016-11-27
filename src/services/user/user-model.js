const validator = require('validator');
const mongoose = require('mongoose');
const USER = require('../../constants/roles').USER;

const Schema = mongoose.Schema;

const OrgRolePairSchema = new Schema({
  organization: { type: Schema.Types.ObjectId, ref: 'Organization' },
  role: { type: String },
});

const OrgDepartmentPairSchema = new Schema({
  organization: { type: Schema.Types.ObjectId, ref: 'Organization' },
  department: { type: Schema.Types.ObjectId, ref: 'Department' },
});

const UserSchema = new Schema({
  name: { type: String, required: true },
  email: {
    type: String,
    required: true,
    unique: true,
    validate: { validator: validator.isEmail, message: '{VALUE} is not a valid email!' },
  },
  password: { type: String },
  facebookId: { type: String },
  phone: {
    type: String,
    validate: {
      validator: (v) => validator.matches(v, /[0-9]{3}-[0-9]{3}-[0-9]{4}/),
      message: '{VALUE} is not a valid phone number!',
    },
  },
  organization_and_role_pairs: [OrgRolePairSchema],
  organization_and_department_pairs: [OrgDepartmentPairSchema],
  created_time: { type: Date, default: Date.now },
  updated_time: { type: Date, default: Date.now },
  customer_app_id: [Schema.Types.ObjectId],
  role: { type: String, required: true, default: USER },
  owner_app_id: [Schema.Types.ObjectId],
});

const Model = mongoose.model('User', UserSchema);

module.exports = Model;
