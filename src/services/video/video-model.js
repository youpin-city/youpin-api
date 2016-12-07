const mongoose = require('mongoose');
require('mongoose-type-url');

const Schema = mongoose.Schema;
const Url = mongoose.SchemaTypes.Url;

const videoSchema = new Schema({
  url: { type: Url, required: true },
  mimetype: { type: String, required: true },
  size: { type: Number, required: true },
});

const Video = mongoose.model('Video', videoSchema);

module.exports = Video;
