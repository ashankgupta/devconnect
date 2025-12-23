import express from 'express';
import { body } from 'express-validator';
import {
  getProjectUpdates,
  createProjectUpdate,
  addUpdateComment,
  toggleUpdateLike,
  deleteProjectUpdate
} from '../controllers/projectUpdateController.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Get project updates (public - anyone can view)
router.get('/:id/updates', getProjectUpdates);

// Create project update (only team members)
router.post('/:id/updates', auth, [
  body('title').trim().isLength({ min: 1, max: 200 }).withMessage('Title is required and max 200 chars'),
  body('content').trim().isLength({ min: 1, max: 2000 }).withMessage('Content is required and max 2000 chars')
], createProjectUpdate);

// Add comment to update (authenticated users)
router.post('/:id/updates/:updateId/comments', auth, [
  body('content').trim().isLength({ min: 1, max: 500 }).withMessage('Comment is required and max 500 chars')
], addUpdateComment);

// Like/unlike update (authenticated users)
router.post('/:id/updates/:updateId/like', auth, toggleUpdateLike);

// Delete update (author or project owner)
router.delete('/:id/updates/:updateId', auth, deleteProjectUpdate);

export default router;