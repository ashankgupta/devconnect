import Community from '../models/Community.js';

// Get all communities
const getCommunities = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.search) {
      filter.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { displayName: { $regex: req.query.search, $options: 'i' } },
        { description: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    const communities = await Community.find(filter)
      .populate('creator', 'name profilePicture')
      .populate('moderators', 'name profilePicture')
      .sort({ memberCount: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Community.countDocuments(filter);

    res.json({
      communities,
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

// Get single community
const getCommunity = async (req, res) => {
  try {
    const community = await Community.findOne({ name: req.params.name })
      .populate('creator', 'name profilePicture')
      .populate('moderators', 'name profilePicture')
      .populate('members.user', 'name profilePicture');

    if (!community) {
      return res.status(404).json({ message: 'Community not found' });
    }

    res.json(community);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create community
const createCommunity = async (req, res) => {
  try {
    const { name, displayName, description, rules, isPrivate } = req.body;

    // Check if community name already exists
    const existingCommunity = await Community.findOne({ name: name.toLowerCase() });
    if (existingCommunity) {
      return res.status(400).json({ message: 'Community name already exists' });
    }

    const community = new Community({
      name: name.toLowerCase(),
      displayName,
      description,
      rules,
      isPrivate,
      creator: req.user._id,
      moderators: [req.user._id],
      members: [{ user: req.user._id }]
    });

    await community.save();
    await community.populate('creator', 'name profilePicture');
    await community.populate('moderators', 'name profilePicture');

    res.status(201).json({
      message: 'Community created successfully',
      community
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update community
const updateCommunity = async (req, res) => {
  try {
    const community = await Community.findOne({ name: req.params.name });

    if (!community) {
      return res.status(404).json({ message: 'Community not found' });
    }

    // Check if user is creator or moderator
    if (community.creator.toString() !== req.user._id.toString() &&
        !community.moderators.some(mod => mod.toString() === req.user._id.toString())) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const updates = {};
    const allowedUpdates = ['displayName', 'description', 'rules', 'isPrivate', 'bannerImage', 'iconImage'];

    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const updatedCommunity = await Community.findByIdAndUpdate(community._id, updates, {
      new: true,
      runValidators: true
    })
      .populate('creator', 'name profilePicture')
      .populate('moderators', 'name profilePicture');

    res.json({
      message: 'Community updated successfully',
      community: updatedCommunity
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete community
const deleteCommunity = async (req, res) => {
  try {
    const community = await Community.findOne({ name: req.params.name });

    if (!community) {
      return res.status(404).json({ message: 'Community not found' });
    }

    // Only creator can delete
    if (community.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Delete all discussions in this community
    const Discussion = (await import('../models/Discussion.js')).default;
    await Discussion.deleteMany({ community: community._id });

    await Community.findByIdAndDelete(community._id);
    res.json({ message: 'Community and all its discussions deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Join community
const joinCommunity = async (req, res) => {
  try {
    const community = await Community.findOne({ name: req.params.name });

    if (!community) {
      return res.status(404).json({ message: 'Community not found' });
    }

    // Check if already a member
    const isMember = community.members.some(member => member.user.toString() === req.user._id.toString());
    if (isMember) {
      return res.status(400).json({ message: 'Already a member' });
    }

    community.members.push({ user: req.user._id });
    await community.save();

    res.json({ message: 'Joined community successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Leave community
const leaveCommunity = async (req, res) => {
  try {
    const community = await Community.findOne({ name: req.params.name });

    if (!community) {
      return res.status(404).json({ message: 'Community not found' });
    }

    // Creator cannot leave
    if (community.creator.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'Creator cannot leave the community' });
    }

    community.members = community.members.filter(member => member.user.toString() !== req.user._id.toString());
    await community.save();

    res.json({ message: 'Left community successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export {
  getCommunities,
  getCommunity,
  createCommunity,
  updateCommunity,
  deleteCommunity,
  joinCommunity,
  leaveCommunity
};