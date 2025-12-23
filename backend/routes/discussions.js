import express from 'express';
import { body } from 'express-validator';
import {
  getDiscussions,
  getDiscussion,
  createDiscussion,
  updateDiscussion,
  deleteDiscussion,
  toggleLike,
  addComment,
  addReply
} from '../controllers/discussionController.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Validation rules
const discussionValidation = [
  body('title').trim().isLength({ min: 1, max: 200 }).withMessage('Title is required and max 200 chars'),
  body('content').trim().isLength({ min: 1, max: 5000 }).withMessage('Content is required and max 5000 chars'),
  body('community').isMongoId().withMessage('Valid community ID is required'),
  body('category').optional().isIn(['general', 'collaboration', 'tech-discussion', 'help', 'showcase'])
];

// Routes
router.get('/', getDiscussions);
router.get('/:id', getDiscussion);
router.post('/', auth, discussionValidation, createDiscussion);
router.put('/:id', auth, updateDiscussion);
router.delete('/:id', auth, deleteDiscussion);
router.post('/:id/like', auth, toggleLike);
router.post('/:id/comments', auth, [
  body('content').trim().isLength({ min: 1, max: 1000 }).withMessage('Comment is required and max 1000 chars')
], addComment);
router.post('/:id/comments/:commentId/replies', auth, [
  body('content').trim().isLength({ min: 1, max: 500 }).withMessage('Reply is required and max 500 chars')
], addReply);

export default router;