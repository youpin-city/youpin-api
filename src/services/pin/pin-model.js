const mongoose = require('mongoose');

const UNVERIFIED = require('../../constants/pin-states').UNVERIFIED;

const Schema = mongoose.Schema;

const voteSchema = new Schema({
  user_id: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
  vote_type: { type: String, required: true },
});

const commentSchema = new Schema({
  created_time: { type: Date, required: true, default: Date.now },
  detail: { type: String, required: true },
  mentions: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  photos: [String],
  tags: [String],
  updated_time: { type: Date, required: true, default: Date.now },
  videos: [String],
  voters: [voteSchema],
});

const pinSchema = new Schema({
  assigned_department: { type: Schema.Types.ObjectId, ref: 'Department' },
  assigned_user: { type: Schema.Types.ObjectId, ref: 'User' },
  categories: [String],
  comments: [commentSchema],
  progresses: [commentSchema],
  created_time: { type: Date, required: true, default: Date.now },
  detail: { type: String, required: true },
  followers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  is_archived: { type: Boolean, default: false },
  is_merged: { type: Boolean, default: false },
  level: String,
  location: {
    type: { type: String, enum: 'Point', default: 'Point' },
    // default to Thailand Democracy Monument
    coordinates: { type: [Number], default: [100.5018549, 13.756727] },
  },
  mentions: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  merged_children_pins: [{ type: Schema.Types.ObjectId, ref: 'Pin' }],
  merged_parent_pin: { type: Schema.Types.ObjectId, ref: 'Pin' },
  neighborhood: [String],
  organization: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
  owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  photos: [String],
  provider: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  processed_by: { type: Schema.Types.ObjectId, ref: 'User' },
  resolved_time: { type: Date },
  status: { type: String, required: true, default: UNVERIFIED },
  tags: [String],
  updated_time: { type: Date, required: true, default: Date.now },
  videos: [Schema.Types.ObjectId],
  voters: [voteSchema],
});

// Index geosearch field
pinSchema.index({ location: '2dsphere' });

pinSchema.pre('find', function populateAssignedUser(next) {
  this.populate('assigned_user');
  next();
});

pinSchema.pre('find', function populateAssignedDepartment(next) {
  this.populate('assigned_department');
  next();
});

const Pin = mongoose.model('Pin', pinSchema);

module.exports = Pin;
