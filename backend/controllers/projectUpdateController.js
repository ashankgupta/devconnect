import ProjectUpdate from '../models/ProjectUpdate.js';
import Project from '../models/Project.js';

// Get project updates
const getProjectUpdates = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const updates = await ProjectUpdate.find({ project: req.params.id })
      .populate('author', 'name profilePicture')
      .populate('comments.user', 'name profilePicture')
      .populate('likes.user', 'name')
      .sort({ isPinned: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await ProjectUpdate.countDocuments({ project: req.params.id });

    res.json({
      updates,
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

// Create project update
const createProjectUpdate = async (req, res) => {
  try {
    const { title, content, type } = req.body;
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if user is team member or owner
    const isOwner = project.owner.equals(req.user._id);
    const isTeamMember = project.teamMembers.some(member => member.user.equals(req.user._id));

    if (!isOwner && !isTeamMember) {
      return res.status(403).json({ message: 'Only team members can create project updates' });
    }

    const update = new ProjectUpdate({
      project: req.params.id,
      author: req.user._id,
      title,
      content,
      type: type || 'status'
    });

    await update.save();
    await update.populate('author', 'name profilePicture');

    res.status(201).json({
      message: 'Project update created successfully',
      update
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Add comment to project update
const addUpdateComment = async (req, res) => {
  try {
    const { content } = req.body;
    const update = await ProjectUpdate.findById(req.params.updateId);

    if (!update) {
      return res.status(404).json({ message: 'Project update not found' });
    }

    update.comments.push({
      user: req.user._id,
      content
    });

    await update.save();
    await update.populate('comments.user', 'name profilePicture');

    const newComment = update.comments[update.comments.length - 1];

    res.status(201).json({
      message: 'Comment added successfully',
      comment: newComment
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Like/unlike project update
const toggleUpdateLike = async (req, res) => {
  try {
    const update = await ProjectUpdate.findById(req.params.updateId);

    if (!update) {
      return res.status(404).json({ message: 'Project update not found' });
    }

    const likeIndex = update.likes.findIndex(like => like.user.equals(req.user._id));

    if (likeIndex > -1) {
      // Unlike
      update.likes.splice(likeIndex, 1);
    } else {
      // Like
      update.likes.push({ user: req.user._id });
    }

    await update.save();

    res.json({
      message: likeIndex > -1 ? 'Update unliked' : 'Update liked',
      likesCount: update.likes.length
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete project update (only author or project owner)
const deleteProjectUpdate = async (req, res) => {
  try {
    const update = await ProjectUpdate.findById(req.params.updateId);

    if (!update) {
      return res.status(404).json({ message: 'Project update not found' });
    }

    const project = await Project.findById(update.project);
    const isOwner = project.owner.equals(req.user._id);
    const isAuthor = update.author.equals(req.user._id);

    if (!isOwner && !isAuthor) {
      return res.status(403).json({ message: 'Not authorized to delete this update' });
    }

    await ProjectUpdate.findByIdAndDelete(req.params.updateId);
    res.json({ message: 'Project update deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export {
  getProjectUpdates,
  createProjectUpdate,
  addUpdateComment,
  toggleUpdateLike,
  deleteProjectUpdate
};