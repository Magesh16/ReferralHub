const Payment = require('../models/Payment');
const Appointment = require('../models/Appointment');
const config = require('../config/env');
const { successResponse, errorResponse, buildPagination } = require('../utils/helpers');
const { notifyPaymentHeld, notifyPaymentReleased } = require('../services/notification.service');

/**
 * POST /api/payments/hold
 * Hold payment in escrow when booking is confirmed
 */
const holdPayment = async (req, res, next) => {
  try {
    const { appointmentId } = req.body;

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return errorResponse(res, 'Appointment not found', 404);
    }

    // Check if payment already exists
    const existingPayment = await Payment.findOne({ appointment: appointmentId });
    if (existingPayment) {
      return errorResponse(res, 'Payment already processed for this appointment', 400);
    }

    const platformFee = Math.round(appointment.amount * (config.platformFeePercent / 100));
    const payeeAmount = appointment.amount - platformFee;

    const payment = await Payment.create({
      appointment: appointmentId,
      payer: appointment.seeker,
      payee: appointment.employee,
      amount: appointment.amount,
      platformFee,
      payeeAmount,
      status: 'held',
      heldAt: new Date(),
      transactionId: `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    });

    await notifyPaymentHeld(appointment.employee, payeeAmount);

    return successResponse(res, payment, 'Payment held in escrow', 201);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/payments/:id/release
 * Release payment to employee after referral is confirmed
 */
const releasePayment = async (req, res, next) => {
  try {
    const payment = await Payment.findById(req.params.id);

    if (!payment) {
      return errorResponse(res, 'Payment not found', 404);
    }

    if (payment.status !== 'held') {
      return errorResponse(res, 'Payment is not in held status', 400);
    }

    payment.status = 'released';
    payment.releasedAt = new Date();
    await payment.save();

    await notifyPaymentReleased(payment.payee, payment.payeeAmount);

    return successResponse(res, payment, 'Payment released');
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/payments/:id/refund
 * Refund payment to seeker
 */
const refundPayment = async (req, res, next) => {
  try {
    const payment = await Payment.findById(req.params.id);

    if (!payment) {
      return errorResponse(res, 'Payment not found', 404);
    }

    if (!['held', 'pending'].includes(payment.status)) {
      return errorResponse(res, 'Payment cannot be refunded in current status', 400);
    }

    payment.status = 'refunded';
    payment.refundedAt = new Date();
    await payment.save();

    return successResponse(res, payment, 'Payment refunded');
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/payments/history
 * Get payment history for current user
 */
const getPaymentHistory = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const query = {
      $or: [{ payer: req.user._id }, { payee: req.user._id }],
    };

    if (status) query.status = status;

    const skip = (Number(page) - 1) * Number(limit);

    const [payments, totalDocs] = await Promise.all([
      Payment.find(query)
        .populate('appointment', 'scheduledDate scheduledTime status')
        .populate('payer', 'name email')
        .populate('payee', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      Payment.countDocuments(query),
    ]);

    const pagination = buildPagination(Number(page), Number(limit), totalDocs);

    return successResponse(res, { payments, pagination }, 'Payment history fetched');
  } catch (error) {
    next(error);
  }
};

module.exports = { holdPayment, releasePayment, refundPayment, getPaymentHistory };
