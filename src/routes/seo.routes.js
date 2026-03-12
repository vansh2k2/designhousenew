const express = require('express');
const router = express.Router();
const seoController = require('../controllers/seo.controller');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for SEO uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = 'uploads/seo';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'seo-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Create SEO
router.post('/create', upload.single('ogImage'), seoController.createSeo);

// Get All SEO
router.get('/all', seoController.getAllSeo);

// Get SEO by Page (frontend usage)
router.get('/single', seoController.getSeoByPage);

// Update SEO
router.put('/update/:id', upload.single('ogImage'), seoController.updateSeo);

// Delete SEO
router.delete('/delete/:id', seoController.deleteSeo);

module.exports = router;
