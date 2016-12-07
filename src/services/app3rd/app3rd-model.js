const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const app3rdSchema = new Schema({
  apikey: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  homepage: { type: String },
  name: { type: String, required: true },
  updatedAt: { type: Date, default: Date.now },
});

const App3rd = mongoose.model('App3rd', app3rdSchema);

module.exports = App3rd;
