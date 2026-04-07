const express = require('express');
const router = express.Router();
const faqController = require('../controllers/faq.controller');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { protect, adminOnly } = require('../middleware/auth.middleware');

// Multer Config for FAQ Images
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadPath = 'uploads/faqs/';
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'faq-' + uniqueSuffix + path.extname(file.originalname));
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
router.get('/', faqController.getFaqs);

// Admin Routes (Protected)
router.post('/headings', protect, adminOnly, faqController.updateHeadings);

router.post('/images', protect, adminOnly, upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: false, message: 'No file uploaded' });
    }
    res.status(200).json({
        success: true,
        data: {
            url: `/uploads/faqs/${req.file.filename}`
        }
    });
});

router.post('/items', protect, adminOnly, faqController.addFaqItem);
router.put('/items/:id', protect, adminOnly, faqController.updateFaqItem);
router.delete('/items/:id', protect, adminOnly, faqController.deleteFaqItem);

module.exports = router;
