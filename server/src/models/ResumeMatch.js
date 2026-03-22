const mongoose = require('mongoose');
const resumeMatchSchema = new mongoose.Schema(
  {
    seeker: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    referralPost: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ReferralPost',
      required: true,
    },
    // ── Core score ──────────────────────────────────────────────────────────
    score:      { type: Number, min: 0, max: 100, required: true },  // 0-100 match %
    confidence: { type: Number, min: 0, max: 1, default: null },     // AI confidence 0.0-1.0
    // ── Fit classification ───────────────────────────────────────────────────
    fitType: {
      type: String,
      enum: ['EXACT_MATCH', 'STRONG_POTENTIAL', 'UPSKILL_REQUIRED', 'NOT_A_MATCH', null],
      default: null,
    },
    // ── Legacy fields (kept for backward compat) ────────────────────────────
    reasons:      [{ type: String }],  // top match reasons (v1)
    missingSkills:[{ type: String }],  // gaps (v1, superseded by criticalGaps)
    // ── Richer analysis (v2) ────────────────────────────────────────────────
    keyStrengths:         [{ type: String }],  // what the candidate already has
    criticalGaps:         [{ type: String }],  // what's missing
    experienceAlignment:  { type: String, default: null },  // 1-sentence assessment
    interviewTips:        [{ type: String }],  // suggested interview questions
    // ── Meta ────────────────────────────────────────────────────────────────
    techCategory: { type: String, default: 'Other' },
    computedAt:   { type: Date, default: Date.now },
  },
  { timestamps: false }
);
// Unique per seeker+job — so we never recompute the same pair
resumeMatchSchema.index({ seeker: 1, referralPost: 1 }, { unique: true });
// For fast top-N queries: seeker's best matches
resumeMatchSchema.index({ seeker: 1, score: -1 });
// For filtering by category
resumeMatchSchema.index({ seeker: 1, techCategory: 1, score: -1 });
module.exports = mongoose.model('ResumeMatch', resumeMatchSchema);