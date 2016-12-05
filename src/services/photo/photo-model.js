const mongoose = require('mongoose');
require('mongoose-type-url');

const Schema = mongoose.Schema;
const Url = mongoose.SchemaTypes.Url;

const photoSchema = new Schema({
  mimetype: { type: String, required: true },
  size: { type: Number, required: true },
  url: { type: Url, required: true },
});

const Photo = mongoose.model('Photo', photoSchema);

module.exports = Photo;
