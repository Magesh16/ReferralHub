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
    score: { type: Number, min: 0, max: 100, required: true },     // 0-100 match %
    reasons: [{ type: String }],                                    // why it matched
    missingSkills: [{ type: String }],                              // skills to build
    techCategory: { type: String, default: 'Other' },              // bucketed category
    computedAt: { type: Date, default: Date.now },
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
