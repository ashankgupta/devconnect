import express from 'express';
import { body } from 'express-validator';
import {
  getCommunities,
  getCommunity,
  createCommunity,
  updateCommunity,
  deleteCommunity,
  joinCommunity,
  leaveCommunity
} from '../controllers/communityController.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Validation rules
const communityValidation = [
  body('name').trim().isLength({ min: 3, max: 50 }).matches(/^[a-zA-Z0-9_-]+$/).withMessage('Name must be 3-50 chars, alphanumeric, underscore, or dash'),
  body('displayName').trim().isLength({ min: 1, max: 100 }).withMessage('Display name is required and max 100 chars'),
  body('description').trim().isLength({ min: 1, max: 500 }).withMessage('Description is required and max 500 chars')
];

// Routes
router.get('/', getCommunities);
router.get('/:name', getCommunity);
router.post('/', auth, communityValidation, createCommunity);
router.put('/:name', auth, updateCommunity);
router.delete('/:name', auth, deleteCommunity);
router.post('/:name/join', auth, joinCommunity);
router.post('/:name/leave', auth, leaveCommunity);

export default router;