import mongoose from 'mongoose';

const projectUpdateSchema = new mongoose.Schema({
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  content: {
    type: String,
    required: true,
    maxlength: 2000
  },
  type: {
    type: String,
    enum: ['status', 'milestone', 'announcement', 'discussion'],
    default: 'status'
  },
  likes: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  comments: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    content: {
      type: String,
      required: true,
      maxlength: 500
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  isPinned: {
    type: Boolean,
    default: false
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
projectUpdateSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Virtual for like count
projectUpdateSchema.virtual('likeCount').get(function() {
  return this.likes.length;
});

// Virtual for comment count
projectUpdateSchema.virtual('commentCount').get(function() {
  return this.comments.length;
});

// Index for efficient queries
projectUpdateSchema.index({ project: 1, createdAt: -1 });
projectUpdateSchema.index({ project: 1, isPinned: -1, createdAt: -1 });

export default mongoose.model('ProjectUpdate', projectUpdateSchema);