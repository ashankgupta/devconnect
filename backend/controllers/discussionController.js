import Discussion from '../models/Discussion.js';

// Get all discussions
const getDiscussions = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.community) filter.community = req.query.community;
    if (req.query.category) filter.category = req.query.category;
    if (req.query.tags) filter.tags = { $in: req.query.tags.split(',') };
    if (req.query.search) {
      filter.$or = [
        { title: { $regex: req.query.search, $options: 'i' } },
        { content: { $regex: req.query.search, $options: 'i' } },
        { tags: { $in: [new RegExp(req.query.search, 'i')] } }
      ];
    }

    const discussions = await Discussion.find(filter)
      .populate('author', 'name branch year profilePicture')
      .populate('community', 'name displayName')
      .sort({ isPinned: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Discussion.countDocuments(filter);

    res.json({
      discussions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get single discussion
const getDiscussion = async (req, res) => {
  try {
    const discussion = await Discussion.findByIdAndUpdate(
      req.params.id,
      { $inc: { viewCount: 1 } },
      { new: true }
    )
      .populate('author', 'name branch year skills profilePicture')
      .populate('community', 'name displayName')
      .populate('likes.user', 'name')
    .populate('comments.user', 'name profilePicture')
    .populate('comments.replies.user', 'name profilePicture')
    .populate('comments.replies.replies.user', 'name profilePicture');

    if (!discussion) {
      return res.status(404).json({ message: 'Discussion not found' });
    }

    res.json(discussion);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create discussion
const createDiscussion = async (req, res) => {
  try {
    const { title, content, tags, category, community } = req.body;

    // Check if user is member of the community
    const Community = (await import('../models/Community.js')).default;
    const communityDoc = await Community.findById(community);
    if (!communityDoc) {
      return res.status(404).json({ message: 'Community not found' });
    }

    const isMember = communityDoc.members.some(member => member.user.toString() === req.user._id.toString());
    if (!isMember) {
      return res.status(403).json({ message: 'You must be a member of the community to post' });
    }

    const discussion = new Discussion({
      title,
      content,
      tags,
      category,
      community,
      author: req.user._id
    });

    await discussion.save();

    // Update community discussion count
    await Community.findByIdAndUpdate(community, { $inc: { discussionCount: 1 } });

    await discussion.populate('author', 'name branch year profilePicture');
    await discussion.populate('community', 'name displayName');

    res.status(201).json({
      message: 'Discussion created successfully',
      discussion
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update discussion
const updateDiscussion = async (req, res) => {
  try {
    const discussion = await Discussion.findById(req.params.id);

    if (!discussion) {
      return res.status(404).json({ message: 'Discussion not found' });
    }

    if (discussion.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const updates = {};
    const allowedUpdates = ['title', 'content', 'tags', 'category'];

    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const updatedDiscussion = await Discussion.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true
    })
      .populate('author', 'name branch year profilePicture')
      .populate('community', 'name displayName');

    res.json({
      message: 'Discussion updated successfully',
      discussion: updatedDiscussion
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete discussion
const deleteDiscussion = async (req, res) => {
  try {
    const discussion = await Discussion.findById(req.params.id);

    if (!discussion) {
      return res.status(404).json({ message: 'Discussion not found' });
    }

    if (discussion.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Update community discussion count
    await Community.findByIdAndUpdate(discussion.community, { $inc: { discussionCount: -1 } });

    await Discussion.findByIdAndDelete(req.params.id);
    res.json({ message: 'Discussion deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Like/Unlike discussion
const toggleLike = async (req, res) => {
  try {
    const discussion = await Discussion.findById(req.params.id);

    if (!discussion) {
      return res.status(404).json({ message: 'Discussion not found' });
    }

    const likeIndex = discussion.likes.findIndex(like => like.user.toString() === req.user._id.toString());

    if (likeIndex > -1) {
      discussion.likes.splice(likeIndex, 1);
    } else {
      discussion.likes.push({ user: req.user._id });
    }

    await discussion.save();
    res.json({
      message: likeIndex > -1 ? 'Discussion unliked' : 'Discussion liked',
      likesCount: discussion.likes.length
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Add comment
const addComment = async (req, res) => {
  try {
    const { content } = req.body;
    const discussion = await Discussion.findById(req.params.id);

    if (!discussion) {
      return res.status(404).json({ message: 'Discussion not found' });
    }

    discussion.comments.push({
      user: req.user._id,
      content
    });

    await discussion.save();
    await discussion.populate('comments.user', 'name profilePicture');

    res.status(201).json({
      message: 'Comment added successfully',
      comment: discussion.comments[discussion.comments.length - 1]
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Helper function to find and update a comment/reply recursively
const findAndUpdateComment = (comments, commentId, updateFn) => {
  for (let i = 0; i < comments.length; i++) {
    const comment = comments[i];

    if (comment._id.toString() === commentId) {
      updateFn(comment);
      return true;
    }

    if (comment.replies && comment.replies.length > 0) {
      // Check replies of this comment
      if (findAndUpdateComment(comment.replies, commentId, updateFn)) {
        return true;
      }
    }
  }
  return false;
};

// Add reply to comment (supports nested replies)
const addReply = async (req, res) => {
  try {
    const { content } = req.body;
    const discussion = await Discussion.findById(req.params.id);

    if (!discussion) {
      return res.status(404).json({ message: 'Discussion not found' });
    }

    let replyAdded = false;
    let newReply = null;

    const updateFn = (comment) => {
      comment.replies.push({
        user: req.user._id,
        content
      });
      newReply = comment.replies[comment.replies.length - 1];
      replyAdded = true;
    };

    if (!findAndUpdateComment(discussion.comments, req.params.commentId, updateFn)) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    await discussion.save();
    await discussion.populate('comments.replies.user', 'name profilePicture');
    await discussion.populate('comments.replies.replies.user', 'name profilePicture');

    res.status(201).json({
      message: 'Reply added successfully',
      reply: newReply
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export {
  getDiscussions,
  getDiscussion,
  createDiscussion,
  updateDiscussion,
  deleteDiscussion,
  toggleLike,
  addComment,
  addReply
};