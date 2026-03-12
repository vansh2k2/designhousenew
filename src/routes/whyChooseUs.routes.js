const express = require('express');
const router = express.Router();
const whyChooseUsController = require('../controllers/whyChooseUs.controller');
const multer = require('multer');
const path = require('path');

// Multer configuration for image upload
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|webp|svg/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);
        if (extname && mimetype) {
            return cb(null, true);
        }
        cb(new Error('Only images are allowed (jpeg, jpg, png, webp, svg)'));
    }
});

router.get('/', whyChooseUsController.getWhyChooseUs);
router.get('/admin', whyChooseUsController.getWhyChooseUs);
router.post('/update', upload.single('image'), whyChooseUsController.updateWhyChooseUs);

module.exports = router;
