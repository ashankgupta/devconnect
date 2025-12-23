import express from 'express';
import {
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
} from '../controllers/adminController.js';
import { auth, adminAuth } from '../middleware/auth.js';

const router = express.Router();

// All admin routes require authentication and admin privileges
router.use(auth);
router.use(adminAuth);

// User management
router.get('/users', getUsers);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

// Project moderation
router.post('/projects/:id/feature', toggleFeatureProject);
router.delete('/projects/:id', deleteProject);

// Discussion moderation
router.post('/discussions/:id/feature', toggleFeatureDiscussion);
router.post('/discussions/:id/pin', togglePinDiscussion);
router.delete('/discussions/:id', deleteDiscussion);

// Event moderation
router.post('/events/:id/feature', toggleFeatureEvent);
router.delete('/events/:id', deleteEvent);

// Dashboard stats
router.get('/stats', getDashboardStats);

export default router;