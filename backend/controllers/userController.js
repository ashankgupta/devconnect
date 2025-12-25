import User from '../models/User.js';

const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password -googleId -isVerified -createdAt -updatedAt');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export { getUserProfile };