const express = require('express');
const { protect } = require('../middleware/auth.middleware');
const {
  holdPayment, releasePayment, refundPayment, getPaymentHistory,
} = require('../controllers/payment.controller');

const router = express.Router();

router.use(protect);

router.post('/hold', holdPayment);
router.post('/:id/release', releasePayment);
router.post('/:id/refund', refundPayment);
router.get('/history', getPaymentHistory);

module.exports = router;
