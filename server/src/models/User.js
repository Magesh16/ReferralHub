const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: 100,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,
      select: false,
    },
    role: {
      type: String,
      enum: ['employee', 'seeker'],
      required: [true, 'Role is required'],
    },
    avatar: { type: String, default: '' },
    phone: { type: String, default: '' },
    isVerified: { type: Boolean, default: false },

    // ── Employee-specific ──
    company: { type: String, default: '' },
    jobTitle: { type: String, default: '' },
    department: { type: String, default: '' },
    yearsAtCompany: { type: Number, default: 0 },
    linkedinUrl: { type: String, default: '' },
    totalReferrals: { type: Number, default: 0 },
    successRate: { type: Number, default: 0 },
    avgRating: { type: Number, default: 0 },

    // ── Seeker-specific ──
    resume: { type: String, default: '' },          // file URL
    resumeText: { type: String, default: '' },       // extracted plain text (for AI)
    resumeUploadedAt: { type: Date },
    skills: [{ type: String }],
    experienceYears: { type: Number, default: 0 },
    currentRole: { type: String, default: '' },
    preferredRoles: [{ type: String }],
    preferredCompanies: [{ type: String }],

    // ── Auth ──
    refreshToken: { type: String, select: false },
  },
  {
    timestamps: true,
  }
);

// ── Indexes ──
userSchema.index({ email: 1 });
userSchema.index({ role: 1, company: 1 });
userSchema.index({ role: 1, skills: 1 });

// ── Hash password before save ──
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// ── Compare password method ──
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// ── Strip sensitive fields from JSON ──
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.refreshToken;
  delete obj.__v;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
