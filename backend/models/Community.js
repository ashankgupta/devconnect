import mongoose from 'mongoose';

const communitySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 50,
    match: /^[a-zA-Z0-9_-]+$/
  },
  displayName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    required: true,
    maxlength: 500
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  moderators: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  members: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    }
  }],
  rules: [{
    title: String,
    description: String
  }],
  isPrivate: {
    type: Boolean,
    default: false
  },
  bannerImage: String,
  iconImage: String,
  discussionCount: {
    type: Number,
    default: 0
  },
  memberCount: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
communitySchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  this.memberCount = this.members.length;
  next();
});

// Virtual for member count
communitySchema.virtual('memberCountVirtual').get(function() {
  return this.members.length;
});

export default mongoose.model('Community', communitySchema);