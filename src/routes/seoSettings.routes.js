const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const seoSettingsController = require('../controllers/seoSettings.controller');
const { protect } = require('../middleware/auth.middleware');

// Multer Config for SEO files
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = 'uploads/seo';
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        // Use original name but ensure uniqueness if needed, or just overwrite as sitemap.xml needs to be exactly that
        cb(null, file.originalname);
    }
});

const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        if (ext !== '.xml' && ext !== '.html' && ext !== '.txt') {
            return cb(new Error('Only .xml, .html and .txt files are allowed'));
        }
        cb(null, true);
    }
});

router.get('/advanced', seoSettingsController.getAdvancedSeo);

// Protected routes
router.put('/scripts', protect, seoSettingsController.updateScripts);
router.post('/upload-file', protect, upload.single('file'), seoSettingsController.uploadSeoFile);
router.delete('/file/:fileId', protect, seoSettingsController.deleteSeoFile);

module.exports = router;
