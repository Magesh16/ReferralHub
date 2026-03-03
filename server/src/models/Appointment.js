const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema(
  {
    referralPost: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ReferralPost',
      required: true,
    },
    seeker: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    scheduledDate: { type: Date, required: [true, 'Scheduled date is required'] },
    scheduledTime: { type: String, required: [true, 'Scheduled time is required'] },
    duration: { type: Number, default: 30 },

    resumeUrl: { type: String, required: [true, 'Resume is required'] },
    coverNote: { type: String, default: '', maxlength: 1000 },

    status: {
      type: String,
      enum: ['pending', 'confirmed', 'completed', 'referred', 'rejected', 'cancelled'],
      default: 'pending',
    },

    employeeNotes: { type: String, default: '' },
    referralProof: { type: String, default: '' },
    referralDate: { type: Date },

    rating: { type: Number, min: 1, max: 5 },
    review: { type: String, default: '', maxlength: 500 },

    // ── AI Resume Match (computed at booking time) ──
    matchScore: { type: Number, min: 0, max: 100, default: null },
    matchReasons: [{ type: String }],
    missingSkills: [{ type: String }],

    amount: { type: Number, required: true },
  },
  {
    timestamps: true,
  }
);

// ── Indexes ──
appointmentSchema.index({ seeker: 1, status: 1 });
appointmentSchema.index({ employee: 1, status: 1 });
appointmentSchema.index({ referralPost: 1 });
appointmentSchema.index({ scheduledDate: 1, employee: 1 });
appointmentSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('Appointment', appointmentSchema);
