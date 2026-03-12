const express = require('express');
const router = express.Router();
const howWeWorkController = require('../controllers/howWeWork.controller');
const { protect, adminOnly } = require('../middleware/auth.middleware');
const upload = require("../middleware/upload.middleware");

// Public routes
router.get('/', howWeWorkController.getHowWeWork);

// Admin routes
router.get('/admin', protect, adminOnly, howWeWorkController.getHowWeWorkForAdmin);
router.post('/', protect, adminOnly, howWeWorkController.createOrUpdateHowWeWork);

// Image upload
router.post('/images', protect, adminOnly, upload.single('image'), howWeWorkController.uploadImage);

module.exports = router;
