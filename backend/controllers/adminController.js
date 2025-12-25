import User from '../models/User.js';
import Project from '../models/Project.js';
import Discussion from '../models/Discussion.js';
import Event from '../models/Event.js';

// Get all users (admin only)
const getUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const users = await User.find({})
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments();

    res.json({
      users,
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

// Update user (admin only)
const updateUser = async (req, res) => {
  try {
    const updates = {};
    const allowedUpdates = ['isAdmin'];

    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const user = await User.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true
    }).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      message: 'User updated successfully',
      user
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete user (admin only)
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent deleting other admins
    if (user.isAdmin && req.user._id.toString() !== req.params.id) {
      return res.status(403).json({ message: 'Cannot delete admin users' });
    }

    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Feature/unfeature project
const toggleFeatureProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    project.isFeatured = !project.isFeatured;
    await project.save();

    res.json({
      message: `Project ${project.isFeatured ? 'featured' : 'unfeatured'} successfully`,
      isFeatured: project.isFeatured
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete project (admin only)
const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    await Project.findByIdAndDelete(req.params.id);
    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Feature/unfeature discussion
const toggleFeatureDiscussion = async (req, res) => {
  try {
    const discussion = await Discussion.findById(req.params.id);

    if (!discussion) {
      return res.status(404).json({ message: 'Discussion not found' });
    }

    discussion.isFeatured = !discussion.isFeatured;
    await discussion.save();

    res.json({
      message: `Discussion ${discussion.isFeatured ? 'featured' : 'unfeatured'} successfully`,
      isFeatured: discussion.isFeatured
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Pin/unpin discussion
const togglePinDiscussion = async (req, res) => {
  try {
    const discussion = await Discussion.findById(req.params.id);

    if (!discussion) {
      return res.status(404).json({ message: 'Discussion not found' });
    }

    discussion.isPinned = !discussion.isPinned;
    await discussion.save();

    res.json({
      message: `Discussion ${discussion.isPinned ? 'pinned' : 'unpinned'} successfully`,
      isPinned: discussion.isPinned
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete discussion (admin only)
const deleteDiscussion = async (req, res) => {
  try {
    const discussion = await Discussion.findById(req.params.id);

    if (!discussion) {
      return res.status(404).json({ message: 'Discussion not found' });
    }

    await Discussion.findByIdAndDelete(req.params.id);
    res.json({ message: 'Discussion deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get dashboard stats
const getDashboardStats = async (req, res) => {
  try {
    const [userCount, projectCount, discussionCount, eventCount] = await Promise.all([
      User.countDocuments(),
      Project.countDocuments(),
      Discussion.countDocuments(),
      Event.countDocuments()
    ]);

    const recentProjects = await Project.find({})
      .populate('owner', 'name')
      .sort({ createdAt: -1 })
      .limit(5);

    const recentDiscussions = await Discussion.find({})
      .populate('author', 'name')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      stats: {
        users: userCount,
        projects: projectCount,
        discussions: discussionCount,
        events: eventCount
      },
      recent: {
        projects: recentProjects,
        discussions: recentDiscussions
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Event moderation
const toggleFeatureEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    event.isFeatured = !event.isFeatured;
    await event.save();

    res.json({
      message: `Event ${event.isFeatured ? 'featured' : 'unfeatured'} successfully`,
      event
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    await Event.findByIdAndDelete(req.params.id);
    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export {
  getUsers,
  updateUser,
  deleteUser,
  toggleFeatureProject,
  deleteProject,
  toggleFeatureDiscussion,
  togglePinDiscussion,
  deleteDiscussion,
  toggleFeatureEvent,
  deleteEvent,
  getDashboardStats
};