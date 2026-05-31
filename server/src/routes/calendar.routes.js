const express = require('express');
const { protect, authorize } = require('../middleware/auth.middleware');
const { getAuthUrl, exchangeCode } = require('../services/calendar.service');
const User = require('../models/User');
const { successResponse, errorResponse } = require('../utils/helpers');

const router = express.Router();

/**
 * GET /api/calendar/auth-url
 * Returns the Google OAuth consent URL.
 * Employee only.
 */
router.get('/auth-url', protect, authorize('employee'), (req, res) => {
  const url = getAuthUrl(req.user._id.toString());
  return successResponse(res, { url }, 'Google Calendar auth URL generated');
});

/**
 * GET /api/auth/google/callback
 * Google redirects here after the user grants consent.
 * Stores tokens on the user document, then redirects to the client.
 */
router.get('/google/callback', async (req, res) => {
  const { code, error } = req.query;

  if (error || !code) {
    return res.redirect(
      `${process.env.CLIENT_URL || 'http://localhost:5173'}/profile?calendarError=access_denied`
    );
  }

  try {
    // We need to identify the user. We encode the userId in the OAuth state param.
    // However, since we don't use state here yet, we rely on the browser session.
    // For simplicity: use the `state` param which we'll set as userId.
    const userId = req.query.state;
    if (!userId) throw new Error('No user state provided');

    const { accessToken, refreshToken } = await exchangeCode(code);

    await User.findByIdAndUpdate(userId, {
      googleAccessToken: accessToken,
      googleRefreshToken: refreshToken,
      googleCalendarConnected: true,
    });

    return res.redirect(
      `${process.env.CLIENT_URL || 'http://localhost:5173'}/profile?calendarConnected=true`
    );
  } catch (err) {
    console.error('Google callback error:', err.message);
    return res.redirect(
      `${process.env.CLIENT_URL || 'http://localhost:5173'}/profile?calendarError=callback_failed`
    );
  }
});

/**
 * GET /api/calendar/status
 * Returns whether the logged-in employee has connected Google Calendar.
 */
router.get('/status', protect, authorize('employee'), async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('+googleCalendarConnected');
    return successResponse(
      res,
      { connected: user.googleCalendarConnected || false },
      'Calendar status fetched'
    );
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
});

/**
 * DELETE /api/calendar/disconnect
 * Removes Google tokens from the user document.
 */
router.delete('/disconnect', protect, authorize('employee'), async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user._id, {
      googleAccessToken: null,
      googleRefreshToken: null,
      googleCalendarConnected: false,
    });
    return successResponse(res, {}, 'Google Calendar disconnected');
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
});

module.exports = router;
