const { google } = require('googleapis');
const config = require('../config/env');

// ── OAuth2 client factory ──────────────────────────────────────────────────
const createOAuth2Client = () =>
  new google.auth.OAuth2(
    config.googleClientId,
    config.googleClientSecret,
    config.googleRedirectUri
  );

/**
 * Generate the Google OAuth consent-screen URL for an employee.
 * @param {string} userId  — passed as OAuth `state` so callback can identify the user
 */
const getAuthUrl = (userId) => {
  const oauth2 = createOAuth2Client();
  return oauth2.generateAuthUrl({
    access_type: 'offline',   // get a refresh_token
    prompt: 'consent',        // always show consent so refresh_token is returned
    state: userId,            // pass userId through the OAuth flow
    scope: [
      'https://www.googleapis.com/auth/calendar.events',
      'https://www.googleapis.com/auth/userinfo.email',
    ],
  });
};

/**
 * Exchange an auth code for access + refresh tokens.
 * @returns {{ accessToken, refreshToken }}
 */
const exchangeCode = async (code) => {
  const oauth2 = createOAuth2Client();
  const { tokens } = await oauth2.getToken(code);
  return {
    accessToken: tokens.access_token,
    refreshToken: tokens.refresh_token,
  };
};

/**
 * Build an authenticated OAuth2 client from stored user tokens.
 */
const buildAuthedClient = (accessToken, refreshToken) => {
  const oauth2 = createOAuth2Client();
  oauth2.setCredentials({
    access_token: accessToken,
    refresh_token: refreshToken,
  });
  return oauth2;
};

/**
 * Create a Google Calendar event with a Google Meet link.
 *
 * @param {{ accessToken, refreshToken }} tokens  — employee's Google tokens
 * @param {Object} details
 * @param {string} details.employeeName
 * @param {string} details.employeeEmail
 * @param {string} details.seekerName
 * @param {string} details.seekerEmail
 * @param {string} details.role          — job role being referred for
 * @param {string} details.company
 * @param {string} details.scheduledDate — 'YYYY-MM-DD'
 * @param {string} details.scheduledTime — '09:00 AM - 09:30 AM'
 * @returns {{ eventId: string, meetLink: string }}
 */
const createCalendarEvent = async (tokens, details) => {
  const auth = buildAuthedClient(tokens.accessToken, tokens.refreshToken);
  const calendar = google.calendar({ version: 'v3', auth });

  // ── Parse time slot ────────────────────────────────────────────────────────
  const { startISO, endISO } = parseTimeSlot(details.scheduledDate, details.scheduledTime);

  const event = {
    summary: `Referral Session — ${details.role} @ ${details.company}`,
    description: [
      `📋 Referral session booked via ReferralHub.`,
      ``,
      `👤 Referrer: ${details.employeeName} (${details.company})`,
      `🔍 Candidate: ${details.seekerName}`,
      `💼 Role: ${details.role}`,
      ``,
      `Please join using the Google Meet link above.`,
    ].join('\n'),
    start: { dateTime: startISO, timeZone: 'Asia/Kolkata' },
    end: { dateTime: endISO, timeZone: 'Asia/Kolkata' },
    attendees: [
      { email: details.employeeEmail, displayName: details.employeeName },
      { email: details.seekerEmail, displayName: details.seekerName },
    ],
    conferenceData: {
      createRequest: {
        requestId: `referralhub-${Date.now()}`,
        conferenceSolutionKey: { type: 'hangoutsMeet' },
      },
    },
    reminders: {
      useDefault: false,
      overrides: [
        { method: 'email', minutes: 24 * 60 },
        { method: 'popup', minutes: 15 },
      ],
    },
  };

  const response = await calendar.events.insert({
    calendarId: 'primary',
    resource: event,
    conferenceDataVersion: 1,
    sendUpdates: 'all',   // sends email invites to all attendees
  });

  return {
    eventId: response.data.id,
    meetLink:
      response.data.conferenceData?.entryPoints?.find(
        (ep) => ep.entryPointType === 'video'
      )?.uri || response.data.hangoutLink || '',
  };
};

/**
 * Delete a Google Calendar event (e.g., on cancellation).
 */
const deleteCalendarEvent = async (tokens, eventId) => {
  try {
    const auth = buildAuthedClient(tokens.accessToken, tokens.refreshToken);
    const calendar = google.calendar({ version: 'v3', auth });
    await calendar.events.delete({
      calendarId: 'primary',
      eventId,
      sendUpdates: 'all',
    });
  } catch (err) {
    // Don't throw — event may already be deleted or tokens invalid
    console.warn(`⚠️  Could not delete calendar event ${eventId}:`, err.message);
  }
};

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Convert "YYYY-MM-DD" + "09:00 AM - 09:30 AM" → ISO date-time strings.
 * Times are interpreted as IST (Asia/Kolkata, UTC+5:30).
 */
const parseTimeSlot = (dateStr, timeSlot) => {
  // e.g. "09:00 AM - 09:30 AM"
  const [startPart, endPart] = timeSlot.split(' - ');
  const toISO = (part) => {
    const [time, meridiem] = part.trim().split(' ');
    let [hours, minutes] = time.split(':').map(Number);
    if (meridiem === 'PM' && hours !== 12) hours += 12;
    if (meridiem === 'AM' && hours === 12) hours = 0;
    // Build UTC offset string for IST
    const pad = (n) => String(n).padStart(2, '0');
    return `${dateStr}T${pad(hours)}:${pad(minutes)}:00+05:30`;
  };
  return { startISO: toISO(startPart), endISO: toISO(endPart) };
};

module.exports = { getAuthUrl, exchangeCode, createCalendarEvent, deleteCalendarEvent };
