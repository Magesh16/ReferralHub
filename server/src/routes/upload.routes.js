const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload.middleware');
const { protect } = require('../middleware/auth.middleware');
const { uploadResume } = require('../controllers/upload.controller');

// POST /api/upload/resume — authenticated seekers only
router.post('/resume', protect, upload.single('resume'), uploadResume);

module.exports = router;
