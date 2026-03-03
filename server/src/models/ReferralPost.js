const mongoose = require('mongoose');

const referralPostSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    company: {
      type: String,
      required: [true, 'Company is required'],
      trim: true,
    },
    role: {
      type: String,
      required: [true, 'Role is required'],
      trim: true,
    },
    department: { type: String, default: '' },
    experienceMin: { type: Number, default: 0, min: 0 },
    experienceMax: { type: Number, default: 99, min: 0 },
    skills: [{ type: String, trim: true }],
    description: { type: String, default: '', maxlength: 2000 },
    location: { type: String, default: 'Remote' },
    jobType: {
      type: String,
      enum: ['full-time', 'contract', 'internship'],
      default: 'full-time',
    },

    // ── Pricing ──
    predictedPrice: { type: Number, required: true },
    finalPrice: { type: Number },
    currency: { type: String, default: 'INR' },

    // ── Availability ──
    maxSlots: { type: Number, default: 5, min: 1, max: 50 },
    bookedSlots: { type: Number, default: 0 },
    availableFrom: { type: Date },
    availableTo: { type: Date },

    // ── Status ──
    status: {
      type: String,
      enum: ['active', 'paused', 'closed', 'expired'],
      default: 'active',
    },

    // ── Tech Category (for AI bucketing — zero token cost) ──
    techCategory: {
      type: String,
      enum: ['MERN', 'Java', 'Frontend', 'Backend', 'Data', 'Mobile', 'DevOps', 'Other'],
      default: 'Other',
    },

    // ── Analytics ──
    totalViews: { type: Number, default: 0 },
    totalBookings: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

// ── Indexes for large-scale querying ──
referralPostSchema.index({ status: 1, company: 1, role: 1 });
referralPostSchema.index({ employee: 1, status: 1 });
referralPostSchema.index({ status: 1, createdAt: -1 });
referralPostSchema.index({ company: 1, predictedPrice: 1 });
referralPostSchema.index({ skills: 1, status: 1 });

// ── Virtual: effective price (finalPrice or predictedPrice) ──
referralPostSchema.virtual('effectivePrice').get(function () {
  return this.finalPrice || this.predictedPrice;
});

// ── Virtual: available slots ──
referralPostSchema.virtual('availableSlots').get(function () {
  return Math.max(0, this.maxSlots - this.bookedSlots);
});

referralPostSchema.set('toJSON', { virtuals: true });
referralPostSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('ReferralPost', referralPostSchema);
