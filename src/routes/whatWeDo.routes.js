const express = require('express');
const router = express.Router();
const whatWeDoController = require('../controllers/whatWeDo.controller');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directory exists
const uploadDir = path.join(process.cwd(), 'uploads/whatwedo');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/whatwedo');
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

// Routes
router.get('/', whatWeDoController.getWhatWeDo);
router.post('/headings', whatWeDoController.updateGlobalContent);
router.post('/cards', upload.single('image'), whatWeDoController.addCard);
router.put('/cards/:id', upload.single('image'), whatWeDoController.updateCard);
router.delete('/cards/:id', whatWeDoController.deleteCard);

module.exports = router;
