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
  detail: { type: String, required: true },
  mentions: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  tags: [String],
  photos: [Schema.Types.ObjectId],
  videos: [Schema.Types.ObjectId],
  voters: [VoteSchema],
  created_time: { type: Date, required: true, default: Date.now },
  updated_time: { type: Date, required: true, default: Date.now },
},
// disable _id field
{ _id: false });

const PinSchema = new Schema({
  detail: { type: String, required: true },
  categories: [String],
  created_time: { type: Date, required: true, default: Date.now },
  updated_time: { type: Date, required: true, default: Date.now },
  resolved_time: { type: Date },
  followers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  level: String,
  mentions: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  neighborhood: [String],
  organization: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
  owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  photos: [String],
  status: { type: String, required: true, default: UNVERIFIED },
  location: {
    type: { type: String, enum: 'Point', default: 'Point' },
    // default to Thailand Democracy Monument
    coordinates: { type: [Number], default: [100.5018549, 13.756727] },
  },
  tags: [String],
  provider: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  comments: [CommentSchema],
  voters: [VoteSchema],
  videos: [Schema.Types.ObjectId],
  is_archived: { type: Boolean, default: false },
  assigned_department: { type: Schema.Types.ObjectId, ref: 'Departmeent' },
  assigned_user: { type: Schema.Types.ObjectId, ref: 'User' },
  processed_by: { type: Schema.Types.ObjectId, ref: 'User' },
});

// Index geosearch field
PinSchema.index({ location: '2dsphere' });

const Model = mongoose.model('Pin', PinSchema);

module.exports = Model;
