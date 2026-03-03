const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    appointment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment',
      required: true,
    },
    payer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    payee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    amount: { type: Number, required: true },
    platformFee: { type: Number, required: true },
    payeeAmount: { type: Number, required: true },

    status: {
      type: String,
      enum: ['pending', 'held', 'released', 'refunded', 'failed'],
      default: 'pending',
    },

    transactionId: { type: String, default: '' },
    paymentMethod: { type: String, default: 'platform_wallet' },

    heldAt: { type: Date },
    releasedAt: { type: Date },
    refundedAt: { type: Date },
  },
  {
    timestamps: true,
  }
);

// ── Indexes ──
paymentSchema.index({ payer: 1, status: 1 });
paymentSchema.index({ payee: 1, status: 1 });
paymentSchema.index({ appointment: 1 });
paymentSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('Payment', paymentSchema);
