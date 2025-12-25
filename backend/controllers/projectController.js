import Project from '../models/Project.js';
import User from '../models/User.js';
import { validationResult } from 'express-validator';
import { createNotification } from './notificationController.js';

// Get all projects with pagination and filters
const getProjects = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.lookingForTeammates === 'true') {
      filter.lookingForTeammates = true;
    }
    if (req.query.techStack) {
      filter.techStack = { $in: req.query.techStack.split(',') };
    }
    if (req.query.owner) {
      filter.owner = req.query.owner;
    }
    if (req.query.search) {
      filter.$or = [
        { title: { $regex: req.query.search, $options: 'i' } },
        { description: { $regex: req.query.search, $options: 'i' } },
        { techStack: { $in: [new RegExp(req.query.search, 'i')] } }
      ];
    }

    const projects = await Project.find(filter)
      .populate('owner', 'name branch year profilePicture')
      .populate('teamMembers.user', 'name branch year profilePicture')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Project.countDocuments(filter);

    res.json({
      projects,
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

// Get single project
const getProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('owner', 'name branch year skills github linkedin profilePicture')
      .populate('teamMembers.user', 'name branch year skills profilePicture')
      .populate('likes.user', 'name')
      .populate('comments.user', 'name profilePicture')
      .populate('collaborationRequests.user', 'name branch year skills');

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    res.json(project);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create project
const createProject = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { title, description, techStack, githubLink, demoLink, images, lookingForTeammates, tags } = req.body;

    const project = new Project({
      title,
      description,
      techStack,
      githubLink,
      demoLink,
      images,
      lookingForTeammates,
      tags,
      owner: req.user._id,
      teamMembers: [{
        user: req.user._id,
        role: 'Owner'
      }]
    });

    await project.save();
    await project.populate('owner', 'name branch year profilePicture');
    await project.populate('teamMembers.user', 'name branch year profilePicture');

    res.status(201).json({
      message: 'Project created successfully',
      project
    });
  } catch (error) {
    console.error('Project creation error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update project
const updateProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const isOwner = project.owner.equals(req.user._id);
    const isTeamMember = project.teamMembers.some(member => member.user.equals(req.user._id));

    if (!isOwner && !isTeamMember) {
      return res.status(403).json({ message: 'Not authorized to update this project' });
    }

    const updates = {};
    const allowedUpdates = ['title', 'description', 'techStack', 'githubLink', 'demoLink', 'images', 'lookingForTeammates', 'tags'];

    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const updatedProject = await Project.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true
    }).populate('owner', 'name branch year profilePicture');

    res.json({
      message: 'Project updated successfully',
      project: updatedProject
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete project
const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this project' });
    }

    await Project.findByIdAndDelete(req.params.id);
    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Like/Unlike project
const toggleLike = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const likeIndex = project.likes.findIndex(like => like.user.toString() === req.user._id.toString());

    if (likeIndex > -1) {
      // Unlike
      project.likes.splice(likeIndex, 1);
    } else {
      // Like
      project.likes.push({ user: req.user._id });
    }

    await project.save();
    res.json({
      message: likeIndex > -1 ? 'Project unliked' : 'Project liked',
      likesCount: project.likes.length
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Add comment
const addComment = async (req, res) => {
  try {
    const { content } = req.body;
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    project.comments.push({
      user: req.user._id,
      content
    });

    await project.save();
    await project.populate('comments.user', 'name profilePicture');

    res.status(201).json({
      message: 'Comment added successfully',
      comment: project.comments[project.comments.length - 1]
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Send collaboration request
const sendCollaborationRequest = async (req, res) => {
  try {
    const { message } = req.body;
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (!project.lookingForTeammates) {
      return res.status(400).json({ message: 'Project is not looking for teammates' });
    }

    // Check if user is already a team member
    const isTeamMember = project.teamMembers.some(
      member => member.user.equals(req.user._id)
    );

    if (isTeamMember) {
      return res.status(400).json({ message: 'You are already a member of this project' });
    }

    // Check if request already exists
    const existingRequest = project.collaborationRequests.find(
      request => request.user.toString() === req.user._id.toString()
    );

    if (existingRequest) {
      return res.status(400).json({ message: 'Collaboration request already sent' });
    }

    project.collaborationRequests.push({
      user: req.user._id,
      message
    });

    await project.save();
    res.status(201).json({ message: 'Collaboration request sent successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Handle collaboration request (accept/reject)
const handleCollaborationRequest = async (req, res) => {
  try {
    const { action } = req.body; // 'accept' or 'reject'
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const request = project.collaborationRequests.id(req.params.requestId);
    if (!request) {
      return res.status(404).json({ message: 'Collaboration request not found' });
    }

    if (action === 'accept') {
      request.status = 'accepted';
      project.teamMembers.push({
        user: request.user,
        role: 'Member'
      });

      // Create notification for accepted request
      await createNotification(
        request.user,
        req.user._id,
        'collaboration_request_accepted',
        'Collaboration Request Accepted',
        `Your collaboration request for "${project.title}" has been accepted!`,
        project._id
      );
    } else if (action === 'reject') {
      request.status = 'rejected';

      // Create notification for rejected request
      await createNotification(
        request.user,
        req.user._id,
        'collaboration_request_rejected',
        'Collaboration Request Rejected',
        `Your collaboration request for "${project.title}" has been rejected.`,
        project._id
      );
    } else {
      return res.status(400).json({ message: 'Invalid action' });
    }

    await project.save();
    res.json({ message: `Collaboration request ${action}ed successfully` });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Leave project (for team members)
const leaveProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const isOwner = project.owner.equals(req.user._id);
    if (isOwner) {
      return res.status(400).json({ message: 'Project owner cannot leave the project' });
    }

    const memberIndex = project.teamMembers.findIndex(member => member.user.equals(req.user._id));
    if (memberIndex === -1) {
      return res.status(400).json({ message: 'You are not a member of this project' });
    }

    // Remove the user from team members
    project.teamMembers.splice(memberIndex, 1);
    await project.save();

    res.json({ message: 'Successfully left the project' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  toggleLike,
  addComment,
  sendCollaborationRequest,
  handleCollaborationRequest,
  leaveProject
};