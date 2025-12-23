import express from 'express';
import { body } from 'express-validator';
import {
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
} from '../controllers/projectController.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Validation rules
const projectValidation = [
  body('title').trim().isLength({ min: 1, max: 100 }).withMessage('Title is required and max 100 chars'),
  body('description').trim().isLength({ min: 1, max: 1000 }).withMessage('Description is required and max 1000 chars'),
  body('techStack').optional().isArray().withMessage('Tech stack must be an array'),
  body('githubLink').optional().isURL().withMessage('Invalid GitHub URL'),
  body('demoLink').optional().isURL().withMessage('Invalid demo URL')
];

// Routes
router.get('/', getProjects);
router.get('/:id', getProject);
router.post('/', auth, projectValidation, createProject);
router.put('/:id', auth, updateProject);
router.delete('/:id', auth, deleteProject);
router.post('/:id/like', auth, toggleLike);
router.post('/:id/comments', auth, [
  body('content').trim().isLength({ min: 1, max: 500 }).withMessage('Comment is required and max 500 chars')
], addComment);
router.post('/:id/collaborate', auth, sendCollaborationRequest);
router.put('/:id/requests/:requestId', auth, handleCollaborationRequest);
router.post('/:id/leave', auth, leaveProject);

export default router;