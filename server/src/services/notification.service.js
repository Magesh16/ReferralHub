const Notification = require('../models/Notification');

/**
 * Create a notification for a user
 */
const createNotification = async ({ user, type, title, message, link = '', metadata = {} }) => {
  try {
    const notification = await Notification.create({
      user,
      type,
      title,
      message,
      link,
      metadata,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days TTL
    });
    return notification;
  } catch (error) {
    console.error('Notification creation failed:', error.message);
    return null;
  }
};

/**
 * Create notifications for common events
 */
const notifyBookingNew = (employeeId, seekerName, referralRole) =>
  createNotification({
    user: employeeId,
    type: 'booking_new',
    title: 'New Booking Request',
    message: `${seekerName} has booked an appointment for the ${referralRole} referral.`,
    link: '/employee/appointments',
  });

const notifyBookingConfirmed = (seekerId, employeeName, referralRole) =>
  createNotification({
    user: seekerId,
    type: 'booking_confirmed',
    title: 'Booking Confirmed',
    message: `${employeeName} has confirmed your appointment for the ${referralRole} referral.`,
    link: '/seeker/bookings',
  });

const notifyReferralSubmitted = (seekerId, employeeName, company) =>
  createNotification({
    user: seekerId,
    type: 'referral_submitted',
    title: 'Referral Submitted! 🎉',
    message: `${employeeName} has submitted your referral at ${company}.`,
    link: '/seeker/bookings',
  });

const notifyPaymentHeld = (employeeId, amount) =>
  createNotification({
    user: employeeId,
    type: 'payment_held',
    title: 'Payment in Escrow',
    message: `₹${amount} has been held in escrow for your referral.`,
    link: '/employee/appointments',
  });

const notifyPaymentReleased = (employeeId, amount) =>
  createNotification({
    user: employeeId,
    type: 'payment_released',
    title: 'Payment Released! 💰',
    message: `₹${amount} has been released to your account.`,
    link: '/employee/appointments',
  });

module.exports = {
  createNotification,
  notifyBookingNew,
  notifyBookingConfirmed,
  notifyReferralSubmitted,
  notifyPaymentHeld,
  notifyPaymentReleased,
};
