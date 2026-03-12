const express = require('express');
const router = express.Router();
const statsCounterController = require('../controllers/statsCounter.controller');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { protect, adminOnly } = require('../middleware/auth.middleware');

// Multer Config for Stats Counter Images
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadPath = 'uploads/stats-counter/';
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'counter-' + uniqueSuffix + path.extname(file.originalname));
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

// Routes
router.get('/', statsCounterController.getStatsCounter);

// Admin Routes (Protected)
router.post('/images', protect, adminOnly, upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: false, message: 'No file uploaded' });
    }
    res.status(200).json({
        success: true,
        data: {
            url: `/uploads/stats-counter/${req.file.filename}`
        }
    });
});

router.post('/cards', protect, adminOnly, statsCounterController.addCounterCard);
router.put('/cards/:id', protect, adminOnly, statsCounterController.updateCounterCard);
router.delete('/cards/:id', protect, adminOnly, statsCounterController.deleteCounterCard);

module.exports = router;
