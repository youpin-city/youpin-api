const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const app3rdSchema = new Schema({
  name: { type: String, required: true },
  homepage: { type: String },
  apikey: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const app3rdModel = mongoose.model('app3rd', app3rdSchema);

module.exports = app3rdModel;
