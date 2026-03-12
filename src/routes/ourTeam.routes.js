const express = require('express');
const router = express.Router();
const teamController = require('../controllers/ourTeam.controller');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for image uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = 'uploads/team/';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'member-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Routes
router.get('/', teamController.getOurTeam);
router.post('/headings', teamController.updateGlobalContent);
router.post('/members', upload.single('image'), teamController.addMember);
router.put('/members/:id', upload.single('image'), teamController.updateMember);
router.delete('/members/:id', teamController.deleteMember);

module.exports = router;
