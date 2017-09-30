const feathers = require('feathers');
const configuration = require('feathers-configuration');
const mongoose = require('mongoose');
const autoIncrement = require('mongoose-auto-increment');

const PENDING = require('../../constants/pin-states').PENDING;
const DEFAULT_LAT_LONG = require('../../constants/defaults').DEFAULT_LAT_LONG;

const Schema = mongoose.Schema;

// Read config file
const conf = configuration('../../../');
const app = feathers().configure(conf);
// Fallback if default location is not set in config file
const defaultLocation = app.get('default').location || DEFAULT_LAT_LONG;

const voteSchema = new Schema({
  user_id: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
  vote_type: { type: String, required: true },
});

const commentSchema = new Schema({
  created_time: { type: Date, required: true, default: Date.now },
  detail: { type: String, required: true },
  owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  mentions: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  photos: [String],
  tags: [String],
  updated_time: { type: Date, required: true, default: Date.now },
  videos: [String],
  voters: [voteSchema],
});

const pinSchema = new Schema({
  reporter: {
    name: { type: String },
    line: { type: String },
  },
  assigned_department: { type: Schema.Types.ObjectId, ref: 'Department' },
  assigned_time: { type: Date },
  assigned_users: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  categories: [String],
  closed_reason: { type: String },
  comments: [commentSchema],
  progresses: [commentSchema],
  created_time: { type: Date, required: true, default: Date.now },
  detail: { type: String, required: true },
  followers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  is_archived: { type: Boolean, default: false },
  is_featured: { type: Boolean, default: false },
  is_merged: { type: Boolean, default: false },
  level: String,
  location: {
    type: { type: String, enum: 'Point', default: 'Point' },
    coordinates: {
      type: [Number],
      default: [defaultLocation.long, defaultLocation.lat],
    },
  },
  mentions: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  merged_children_pins: [{ type: Schema.Types.ObjectId, ref: 'Pin' }],
  merged_parent_pin: { type: Schema.Types.ObjectId, ref: 'Pin' },
  neighborhood: [String],
  organization: {
    type: Schema.Types.ObjectId,
    ref: 'Organization',
    required: true,
  },
  owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  photos: [String],
  provider: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  processed_by: { type: Schema.Types.ObjectId, ref: 'User' },
  processing_time: { type: Date },
  rejected_time: { type: Date },
  resolved_time: { type: Date },
  status: { type: String, required: true, default: PENDING },
  tags: [String],
  updated_time: { type: Date, required: true, default: Date.now },
  videos: [Schema.Types.ObjectId],
  voters: [voteSchema],
});

// Index geosearch field
pinSchema.index({ location: '2dsphere' });

pinSchema.pre('find', function populateFields(next) {
  this.populate('assigned_users')
    .populate('assigned_department')
    .populate('owner')
    .populate('progresses.owner');
  next();
});

pinSchema.pre('findOne', function populateFields(next) {
  this.populate('assigned_users')
    .populate('assigned_department')
    .populate('owner')
    .populate('progresses.owner');
  next();
});

autoIncrement.initialize(mongoose);
pinSchema.plugin(autoIncrement.plugin, { model: 'Pin', field: 'issue_id', startAt: 1703 });

const Pin = mongoose.model('Pin', pinSchema);

Pin.resetCount((err, nextCount) => {});

module.exports = Pin;
