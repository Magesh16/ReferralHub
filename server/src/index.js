const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const connectDB = require('./config/db');
const config = require('./config/env');
const { errorHandler } = require('./middleware/error.middleware');

// Route imports
const authRoutes = require('./routes/auth.routes');
const referralRoutes = require('./routes/referral.routes');
const appointmentRoutes = require('./routes/appointment.routes');
const paymentRoutes = require('./routes/payment.routes');
const notificationRoutes = require('./routes/notification.routes');
const uploadRoutes = require('./routes/upload.routes');
const resumeMatchRoutes = require('./routes/resumeMatch.routes');
const calendarRoutes = require('./routes/calendar.routes');

const app = express();

// ── Middleware ──
// app.use(cors({
//   origin: ['http://localhost:5173', 'http://localhost:3000', 'https://referralhub-client.onrender.com/'],
//   credentials: true,
// }));
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://referralhub-client.onrender.com',
];
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error('Not allowed by CORS'));
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// ── Serve uploaded resumes as static files ──
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ── Routes ──
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'ReferralHub API is running 🚀' });
});

app.use('/api/auth', authRoutes);
app.use('/api/referrals', referralRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/resume-match', resumeMatchRoutes);
app.use('/api/calendar', calendarRoutes);
// Google OAuth callback lives at /api/auth/google/callback
app.use('/api/auth', calendarRoutes);

// ── 404 handler ──
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// ── Global error handler ──
app.use(errorHandler);

// ── Start server ──
const startServer = async () => {
  await connectDB();

  app.listen(config.port, () => {
    console.log(`\n🚀 ReferralHub API running on http://localhost:${config.port}`);
    console.log(`📦 Environment: ${process.env.NODE_ENV || 'development'}\n`);
  });
};

startServer();

module.exports = app;
