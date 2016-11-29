const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const app3rdSchema = new Schema({
  apikey: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  homepage: { type: String },
  name: { type: String, required: true },
  updatedAt: { type: Date, default: Date.now },
});

const app3rdModel = mongoose.model('app3rd', app3rdSchema);

module.exports = app3rdModel;
