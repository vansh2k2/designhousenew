const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analytics.controller');

// Public route to log clicks
router.post('/log', analyticsController.logClick);

// Protected route to get stats (should ideally have auth middleware)
router.get('/stats', analyticsController.getAnalytics);

module.exports = router;
