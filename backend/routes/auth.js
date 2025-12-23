import express from 'express';
import { body } from 'express-validator';
import { register, login, getProfile, updateProfile, googleAuth, googleAuthCallback, googleAuthSuccess } from '../controllers/authController.js';
import { auth } from '../middleware/auth.js';
import passport from '../config/passport.js';

const router = express.Router();

// Validation rules
const registerValidation = [
  body('name').trim().isLength({ min: 2, max: 50 }).withMessage('Name must be 2-50 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('branch').isIn(['CSE', 'ECE', 'ME', 'CE', 'EE', 'IT', 'Other']).withMessage('Invalid branch'),
  body('year').isInt({ min: 1, max: 4 }).withMessage('Year must be 1-4')
];

// Routes
router.post('/register', registerValidation, register);
router.post('/login', login);
router.get('/profile', auth, getProfile);
router.put('/profile', auth, updateProfile);

// Google OAuth routes (only if configured)
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  router.get('/google', googleAuth);
  router.get('/google/callback', passport.authenticate('google', { session: false }), googleAuthSuccess);
}

export default router;