const validator = require('validator');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  name: { type: String, required: true },
  email: {
    type: String, required: true, unique: true,
    validate: { validator: validator.isEmail, message: '{VALUE} is not a valid email!' },
  },
  password: { type: String, required: true },
  phone: {
    type: String,
    validate: {
      validator: (v) => validator.matches(v, /[0-9]{3}-[0-9]{3}-[0-9]{4}/),
      message: '{VALUE} is not a valid phone number!',
    },
  },
  department: [{ type: Schema.Types.ObjectId, ref: 'Department' }],
  created_time: { type: Date, default: Date.now },
  updated_time: { type: Date, default: Date.now },
  customer_app_id: [Schema.Types.ObjectId],
  role: { type: String, required: true },
  owner_app_id: [Schema.Types.ObjectId],
});

const Model = mongoose.model('User', UserSchema);

module.exports = Model;
