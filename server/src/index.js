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

const app = express();

// ── Middleware ──
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
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
