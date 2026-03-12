
const express = require('express');
const router = express.Router();
const youtubeController = require('../controllers/youtube.controller');

// GET latest videos from channel
router.get('/latest', youtubeController.getLatestVideos);

module.exports = router;
