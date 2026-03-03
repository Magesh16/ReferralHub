const express = require('express');
const { body } = require('express-validator');
const { validate } = require('../middleware/validate.middleware');
const { protect, authorize } = require('../middleware/auth.middleware');
const {
  createAppointment, getAppointments, getAppointmentById,
  updateAppointmentStatus, markAsReferred, submitReview,
} = require('../controllers/appointment.controller');

const router = express.Router();

router.use(protect);

router.post(
  '/',
  authorize('seeker'),
  [
    body('referralPostId').notEmpty().withMessage('Referral post ID is required'),
    body('scheduledDate').notEmpty().withMessage('Scheduled date is required'),
    body('scheduledTime').notEmpty().withMessage('Scheduled time is required'),
    body('resumeUrl').notEmpty().withMessage('Resume is required'),
  ],
  validate,
  createAppointment
);

router.get('/', getAppointments);
router.get('/:id', getAppointmentById);

router.patch(
  '/:id/status',
  [body('status').isIn(['confirmed', 'rejected', 'cancelled']).withMessage('Invalid status')],
  validate,
  updateAppointmentStatus
);

router.patch('/:id/refer', authorize('employee'), markAsReferred);

router.post(
  '/:id/review',
  authorize('seeker'),
  [body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be 1-5')],
  validate,
  submitReview
);

module.exports = router;
