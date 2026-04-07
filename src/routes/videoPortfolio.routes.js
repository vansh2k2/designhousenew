const express = require('express');
const router = express.Router();
const videoPortfolioController = require('../controllers/videoPortfolio.controller');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { protect, adminOnly } = require('../middleware/auth.middleware');

// Multer Config for Video Portfolio Images
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadPath = 'uploads/video-portfolio/';
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'hero-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|webp/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);
        if (extname && mimetype) {
            return cb(null, true);
        }
        cb(new Error('Only images are allowed (jpeg, jpg, png, webp)'));
    }
});

// GET all data
router.get('/', videoPortfolioController.getVideoPortfolio);

// Update hero section
router.post('/hero', protect, adminOnly, videoPortfolioController.updateHeroSection);

// Image Upload Route
router.post('/upload', protect, adminOnly, upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: false, message: 'No file uploaded' });
    }
    res.status(200).json({
        success: true,
        data: {
            url: `/uploads/video-portfolio/${req.file.filename}`
        }
    });
});

// Add video
router.post('/videos', protect, adminOnly, videoPortfolioController.addVideo);

// Update video
router.put('/videos/:id', videoPortfolioController.updateVideo);

// Delete video
router.delete('/videos/:id', videoPortfolioController.deleteVideo);

module.exports = router;
