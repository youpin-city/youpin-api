const mongoose = require('mongoose');

const UNVERIFIED = require('../../constants/pin-states').UNVERIFIED;

const Schema = mongoose.Schema;

const VoteSchema = new Schema({
  user_id: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
  vote_type: { type: String, required: true },
},
// disable _id field
{ _id: false });

const CommentSchema = new Schema({
  created_time: { type: Date, required: true, default: Date.now },
  detail: { type: String, required: true },
  mentions: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  photos: [Schema.Types.ObjectId],
  tags: [String],
  updated_time: { type: Date, required: true, default: Date.now },
  videos: [Schema.Types.ObjectId],
  voters: [VoteSchema],
},
// disable _id field
{ _id: false });

const PinSchema = new Schema({
  assigned_department: { type: Schema.Types.ObjectId, ref: 'Departmeent' },
  assigned_user: { type: Schema.Types.ObjectId, ref: 'User' },
  categories: [String],
  comments: [CommentSchema],
  created_time: { type: Date, required: true, default: Date.now },
  detail: { type: String, required: true },
  followers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  is_archived: { type: Boolean, default: false },
  level: String,
  location: {
    type: { type: String, enum: 'Point', default: 'Point' },
    // default to Thailand Democracy Monument
    coordinates: { type: [Number], default: [100.5018549, 13.756727] },
  },
  mentions: [{ type: Schema.Types.ObjectId, ref: 'User' }],
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
  voters: [VoteSchema],
});

// Index geosearch field
PinSchema.index({ location: '2dsphere' });

const Model = mongoose.model('Pin', PinSchema);

module.exports = Model;
