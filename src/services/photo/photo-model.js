const mongoose = require('mongoose');
require('mongoose-type-url');

const Schema = mongoose.Schema;
const Url = mongoose.SchemaTypes.Url;

const PhotoSchema = new Schema({
  mimetype: { type: String, required: true },
  size: { type: Number, required: true },
  url: { type: Url, required: true },
});

const PhotoModel = mongoose.model('Photo', PhotoSchema);

module.exports = PhotoModel;
