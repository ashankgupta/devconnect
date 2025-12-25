import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { validationResult } from 'express-validator';
import passport from 'passport';
import User from '../models/User.js';

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: '7d'
  });
};

const googleAuth = passport.authenticate('google', {
  scope: ['profile', 'email']
});

const googleAuthCallback = (req, res) => {
};

const googleAuthSuccess = (req, res) => {
  try {
    if (!req.user) {
      console.error('No user found in request');
      return res.redirect(`${process.env.FRONTEND_URL}/auth/error`);
    }

    const token = generateToken(req.user._id);
    res.redirect(`${process.env.FRONTEND_URL}/auth/success?token=${token}`);
  } catch (error) {
    console.error('Error in googleAuthSuccess:', error);
    res.redirect(`${process.env.FRONTEND_URL}/auth/error`);
  }
};

const register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password, branch, year, skills, github, linkedin, bio } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = new User({
      name,
      email,
      password: hashedPassword,
      branch,
      year,
      skills: skills || [],
      github,
      linkedin,
      bio
    });

    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        branch: user.branch,
        year: user.year,
        skills: user.skills,
        github: user.github,
        linkedin: user.linkedin,
        bio: user.bio,
        profilePicture: user.profilePicture
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate token
    const token = generateToken(user._id);

    res.json({
      message: 'Login successful',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        branch: user.branch,
        year: user.year,
        skills: user.skills,
        github: user.github,
        linkedin: user.linkedin,
        bio: user.bio,
        profilePicture: user.profilePicture,
        isAdmin: user.isAdmin
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    const updates = {};
    const allowedUpdates = ['name', 'branch', 'year', 'skills', 'github', 'linkedin', 'bio', 'profilePicture'];

    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true
    }).select('-password');

    res.json({
      message: 'Profile updated successfully',
      user
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export {
  register,
  login,
  getProfile,
  updateProfile,
  googleAuth,
  googleAuthCallback,
  googleAuthSuccess
};
