const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const { computeMyMatches, getMyMatches, getMatchForJob, clearCache } = require('../controllers/resumeMatch.controller');

// All routes require authentication
router.use(protect);

// POST /api/resume-match/compute  — run full AI match for all active jobs
router.post('/compute', computeMyMatches);

// GET /api/resume-match           — get cached matches (?category=MERN&limit=20)
router.get('/', getMyMatches);

// DELETE /api/resume-match/cache — clear stale cached scores (force recompute)
router.delete('/cache', clearCache);

// GET /api/resume-match/:referralPostId — on-demand match for a specific job
router.get('/:referralPostId', getMatchForJob);

module.exports = router;
