const Appointment = require('../models/Appointment');
const ReferralPost = require('../models/ReferralPost');
const User = require('../models/User');
const { successResponse, errorResponse, buildPagination } = require('../utils/helpers');
const {
  notifyBookingNew,
  notifyBookingConfirmed,
  notifyReferralSubmitted,
} = require('../services/notification.service');

/**
 * POST /api/appointments
 * Book an appointment (seeker only)
 */
const createAppointment = async (req, res, next) => {
  try {
    const { referralPostId, scheduledDate, scheduledTime, resumeUrl, coverNote } = req.body;

    const referral = await ReferralPost.findById(referralPostId);
    if (!referral) {
      return errorResponse(res, 'Referral post not found', 404);
    }

    if (referral.status !== 'active') {
      return errorResponse(res, 'This referral is no longer active', 400);
    }

    if (referral.bookedSlots >= referral.maxSlots) {
      return errorResponse(res, 'No slots available', 400);
    }

    // Prevent duplicate bookings
    const existing = await Appointment.findOne({
      referralPost: referralPostId,
      seeker: req.user._id,
      status: { $in: ['pending', 'confirmed'] },
    });
    if (existing) {
      return errorResponse(res, 'You already have an active booking for this referral', 400);
    }

    const appointment = await Appointment.create({
      referralPost: referralPostId,
      seeker: req.user._id,
      employee: referral.employee,
      scheduledDate,
      scheduledTime,
      resumeUrl,
      coverNote,
      amount: referral.finalPrice || referral.predictedPrice,
    });

    // Update referral slot count
    referral.bookedSlots += 1;
    referral.totalBookings += 1;
    await referral.save();

    // Notify employee
    await notifyBookingNew(referral.employee, req.user.name, referral.role);

    const populated = await Appointment.findById(appointment._id)
      .populate('referralPost', 'company role predictedPrice finalPrice')
      .populate('employee', 'name avatar company')
      .populate('seeker', 'name avatar');

    return successResponse(res, populated, 'Appointment booked', 201);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/appointments
 * Get user's appointments (employee or seeker)
 */
const getAppointments = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = {};

    if (req.user.role === 'employee') {
      query.employee = req.user._id;
    } else {
      query.seeker = req.user._id;
    }

    if (status) query.status = status;

    const skip = (Number(page) - 1) * Number(limit);

    const [appointments, totalDocs] = await Promise.all([
      Appointment.find(query)
        .populate('referralPost', 'company role predictedPrice finalPrice status')
        .populate('employee', 'name avatar company jobTitle')
        .populate('seeker', 'name avatar email skills experienceYears currentRole')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      Appointment.countDocuments(query),
    ]);

    const pagination = buildPagination(Number(page), Number(limit), totalDocs);

    return successResponse(res, { appointments, pagination }, 'Appointments fetched');
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/appointments/:id
 */
const getAppointmentById = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('referralPost', 'company role predictedPrice finalPrice description skills')
      .populate('employee', 'name avatar company jobTitle linkedinUrl')
      .populate('seeker', 'name avatar email skills experienceYears currentRole resume');

    if (!appointment) {
      return errorResponse(res, 'Appointment not found', 404);
    }

    // Only participants can view
    const userId = req.user._id.toString();
    if (
      appointment.employee._id.toString() !== userId &&
      appointment.seeker._id.toString() !== userId
    ) {
      return errorResponse(res, 'Not authorized', 403);
    }

    return successResponse(res, appointment, 'Appointment fetched');
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/appointments/:id/status
 * Update status (confirm, reject, complete, cancel)
 */
const updateAppointmentStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return errorResponse(res, 'Appointment not found', 404);
    }

    const userId = req.user._id.toString();

    // Employee can confirm or reject
    if (['confirmed', 'rejected'].includes(status)) {
      if (appointment.employee.toString() !== userId) {
        return errorResponse(res, 'Only the referral provider can confirm/reject', 403);
      }
    }

    // Seeker can cancel
    if (status === 'cancelled') {
      if (appointment.seeker.toString() !== userId) {
        return errorResponse(res, 'Only the seeker can cancel', 403);
      }
    }

    appointment.status = status;
    await appointment.save();

    // Notifications
    if (status === 'confirmed') {
      const employee = await User.findById(appointment.employee);
      const referral = await ReferralPost.findById(appointment.referralPost);
      await notifyBookingConfirmed(appointment.seeker, employee.name, referral.role);
    }

    return successResponse(res, appointment, `Appointment ${status}`);
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/appointments/:id/refer
 * Mark as referred with proof (employee only)
 */
const markAsReferred = async (req, res, next) => {
  try {
    const { referralProof, employeeNotes } = req.body;
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return errorResponse(res, 'Appointment not found', 404);
    }

    if (appointment.employee.toString() !== req.user._id.toString()) {
      return errorResponse(res, 'Only the referral provider can mark as referred', 403);
    }

    appointment.status = 'referred';
    appointment.referralProof = referralProof || '';
    appointment.employeeNotes = employeeNotes || '';
    appointment.referralDate = new Date();
    await appointment.save();

    // Update employee stats
    const employee = await User.findById(appointment.employee);
    employee.totalReferrals += 1;
    await employee.save();

    // Notify seeker
    const referral = await ReferralPost.findById(appointment.referralPost);
    await notifyReferralSubmitted(appointment.seeker, employee.name, referral.company);

    return successResponse(res, appointment, 'Referral submitted');
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/appointments/:id/review
 * Submit rating & review (seeker only)
 */
const submitReview = async (req, res, next) => {
  try {
    const { rating, review } = req.body;
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return errorResponse(res, 'Appointment not found', 404);
    }

    if (appointment.seeker.toString() !== req.user._id.toString()) {
      return errorResponse(res, 'Only the seeker can review', 403);
    }

    if (!['referred', 'completed'].includes(appointment.status)) {
      return errorResponse(res, 'Can only review after referral is submitted', 400);
    }

    appointment.rating = rating;
    appointment.review = review || '';
    appointment.status = 'completed';
    await appointment.save();

    // Update employee average rating
    const allReviews = await Appointment.find({
      employee: appointment.employee,
      rating: { $exists: true, $ne: null },
    });
    const avgRating =
      allReviews.reduce((sum, a) => sum + a.rating, 0) / allReviews.length;

    await User.findByIdAndUpdate(appointment.employee, {
      avgRating: Math.round(avgRating * 10) / 10,
    });

    return successResponse(res, appointment, 'Review submitted');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createAppointment,
  getAppointments,
  getAppointmentById,
  updateAppointmentStatus,
  markAsReferred,
  submitReview,
};
