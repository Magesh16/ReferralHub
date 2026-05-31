require('dotenv').config();

module.exports = {
  port: process.env.PORT || 5000,
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/referralhub',
  jwtSecret: process.env.JWT_SECRET || 'default_jwt_secret',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'default_refresh_secret',
  jwtExpire: process.env.JWT_EXPIRE || '15m',
  jwtRefreshExpire: process.env.JWT_REFRESH_EXPIRE || '7d',
  platformFeePercent: parseFloat(process.env.PLATFORM_FEE_PERCENT) || 15,
  baseReferralPrice: parseFloat(process.env.BASE_REFERRAL_PRICE) || 500,
  // ── Google OAuth ──
  googleClientId: process.env.GOOGLE_CLIENT_ID || '',
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
  googleRedirectUri: process.env.GOOGLE_REDIRECT_URI || 'http://localhost:5000/api/auth/google/callback',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
};
