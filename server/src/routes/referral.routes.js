const express = require('express');
const { body } = require('express-validator');
const { validate } = require('../middleware/validate.middleware');
const { protect, authorize } = require('../middleware/auth.middleware');
const {
  createReferral, getReferrals, getMyReferrals,
  getReferralById, updateReferral, updateReferralStatus, getPredictedPrice,
} = require('../controllers/referral.controller');

const router = express.Router();

// Public: browse referrals
router.get('/', getReferrals);
router.get('/predict-price', getPredictedPrice);

// Protected routes
router.use(protect);

router.get('/my-posts', authorize('employee'), getMyReferrals);

router.post(
  '/',
  authorize('employee'),
  [
    body('company').trim().notEmpty().withMessage('Company is required'),
    body('role').trim().notEmpty().withMessage('Role is required'),
  ],
  validate,
  createReferral
);

router.get('/:id', getReferralById);
router.put('/:id', authorize('employee'), updateReferral);

router.patch(
  '/:id/status',
  authorize('employee'),
  [body('status').isIn(['active', 'paused', 'closed']).withMessage('Invalid status')],
  validate,
  updateReferralStatus
);

module.exports = router;
