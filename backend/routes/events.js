import express from 'express';
import { body } from 'express-validator';
import {
  getEvents,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent,
  registerForEvent,
  toggleInterest
} from '../controllers/eventController.js';
import { auth, adminAuth } from '../middleware/auth.js';

const router = express.Router();

// Validation rules
const eventValidation = [
  body('title').trim().isLength({ min: 1, max: 200 }).withMessage('Title is required'),
  body('description').trim().isLength({ min: 1, max: 2000 }).withMessage('Description is required'),
  body('type').isIn(['hackathon', 'workshop', 'seminar', 'meetup', 'competition']).withMessage('Invalid event type'),
  body('startDate').isISO8601().withMessage('Valid start date required'),
  body('endDate').isISO8601().withMessage('Valid end date required')
];

// Routes
router.get('/', getEvents);
router.get('/:id', getEvent);
router.post('/', auth, eventValidation, createEvent);
router.put('/:id', auth, updateEvent);
router.delete('/:id', auth, deleteEvent);
router.post('/:id/register', auth, registerForEvent);
router.post('/:id/interest', auth, toggleInterest);

export default router;