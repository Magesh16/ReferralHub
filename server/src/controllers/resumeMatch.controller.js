const { computeMatchesForSeeker, getOrComputeMatchScore } = require('../services/resumeMatch.service');
const ResumeMatch = require('../models/ResumeMatch');
const ReferralPost = require('../models/ReferralPost');
const User = require('../models/User');

/**
 * POST /api/resume-match/compute
 * Trigger full match computation for the logged-in seeker.
 * Returns top N matches sorted by score.
 */
const computeMyMatches = async (req, res) => {
  try {
    const seeker = await User.findById(req.user._id).select('resumeText skills role resume');

    if (seeker.role !== 'seeker') {
      return res.status(403).json({ success: false, message: 'Only seekers can use this feature' });
    }

    // Require at least a resume file OR non-empty skills to proceed
    const hasResumeText = seeker.resumeText && seeker.resumeText.trim().length > 50;
    const hasSkills = seeker.skills && seeker.skills.length > 0;
    if (!hasResumeText && !hasSkills && !seeker.resume) {
      return res.status(400).json({
        success: false,
        message: 'Please upload your resume or add your skills in Profile Settings before running match analysis.',
      });
    }

    await computeMatchesForSeeker(seeker._id, seeker.resumeText || '', seeker.skills || []);

    // Return all cached matches for this seeker (with post details)
    const matches = await ResumeMatch.find({ seeker: seeker._id })
      .sort({ score: -1 })
      .limit(50)
      .populate({
        path: 'referralPost',
        select: 'role company skills predictedPrice finalPrice location jobType techCategory status bookedSlots maxSlots employee',
        populate: { path: 'employee', select: 'name jobTitle avgRating' },
      })
      .lean();

    // Filter out deleted/closed referrals
    const live = matches.filter((m) => m.referralPost && m.referralPost.status === 'active');

    return res.json({ success: true, data: { matches: live, total: live.length } });
  } catch (err) {
    console.error('[ResumeMatch] compute error:', err);
    // Surface quota errors clearly to the client
    if (err.message && err.message.startsWith('QUOTA_EXCEEDED')) {
      return res.status(503).json({
        success: false,
        message: '⚠️ Gemini API daily quota exhausted. AI matching will be available again tomorrow. You can still browse your existing matches.',
        quotaExceeded: true,
      });
    }
    return res.status(500).json({ success: false, message: err.message || 'Match computation failed' });
  }
};

/**
 * GET /api/resume-match
 * Get cached matches for the logged-in seeker.
 * Optional query: ?category=MERN&limit=10
 */
const getMyMatches = async (req, res) => {
  try {
    const { category, limit = 20 } = req.query;
    const filter = { seeker: req.user._id };
    if (category && category !== 'All') filter.techCategory = category;

    const matches = await ResumeMatch.find(filter)
      .sort({ score: -1 })
      .limit(parseInt(limit))
      .populate({
        path: 'referralPost',
        select: 'role company skills predictedPrice finalPrice location jobType techCategory status bookedSlots maxSlots employee',
        populate: { path: 'employee', select: 'name jobTitle avgRating' },
      })
      .lean();

    const live = matches.filter((m) => m.referralPost && m.referralPost.status === 'active');

    return res.json({ success: true, data: { matches: live } });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch matches' });
  }
};

/**
 * GET /api/resume-match/:referralPostId
 * Get (or compute on-demand) match score for a specific job.
 * Used on the ReferralDetail + BookAppointment pages.
 */
const getMatchForJob = async (req, res) => {
  try {
    const seeker = await User.findById(req.user._id).select('resumeText skills role');

    if (seeker.role !== 'seeker') {
      return res.status(403).json({ success: false, message: 'Seekers only' });
    }

    const match = await getOrComputeMatchScore(
      seeker._id,
      req.params.referralPostId,
      seeker.resumeText,
      seeker.skills || []
    );

    if (!match) {
      return res.json({ success: true, data: null, message: 'Upload resume to see your match score' });
    }

    return res.json({ success: true, data: match });
  } catch (err) {
    console.error('[ResumeMatch] on-demand error:', err);
    return res.status(500).json({ success: false, message: 'Match computation failed' });
  }
};

/**
 * DELETE /api/resume-match/cache
 * Clear all cached match scores for the logged-in seeker.
 * Use this after quota resets to force a fresh AI recompute.
 */
const clearCache = async (req, res) => {
  try {
    const result = await ResumeMatch.deleteMany({ seeker: req.user._id });
    return res.json({
      success: true,
      data: { cleared: result.deletedCount },
      message: `Cleared ${result.deletedCount} cached match scores. Run AI Analysis to recompute fresh scores.`,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to clear cache' });
  }
};

module.exports = { computeMyMatches, getMyMatches, getMatchForJob, clearCache };
