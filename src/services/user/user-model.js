const validator = require('validator');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  name: {type: String, required: true, unique: true},
  email: {
    type: String,
    validate: {validator: validator.isEmail, message: '{VALUE} is not a valid email!'}
  },
  password: {type: String, required: true},
  phone: {
    type: String,
    validate: {
      validator: function(v) {
        console.log(v);
        return validator.matches(v, /[0-9]{3}-[0-9]{3}-[0-9]{4}/)
      },
      message: '{VALUE} is not a valid phone number!'
    }
  },
  created_time: {type: Date, 'default': Date.now},
  updated_time: {type: Date, 'default': Date.now},
  fb_id: {type: String, required: true},
  role: {type: String, required: true},
  app_id: [Schema.Types.ObjectId]
});

const Model = mongoose.model('User', UserSchema);

module.exports = Model;
