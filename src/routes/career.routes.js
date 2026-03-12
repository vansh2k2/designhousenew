const express = require('express');
const router = express.Router();
const careerController = require('../controllers/career.controller');

// ✅ CORRECT IMPORT - curly braces use करो
const { protect } = require('../middleware/auth.middleware');

const multer = require('multer');
const path = require('path');
const fs = require('fs');

// ✅ Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/career';

    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'career-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter - only allow certain file types
const fileFilter = (req, file, cb) => {
  const allowedTypes = /pdf|doc|docx|jpg|jpeg|png/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Only PDF, DOC, DOCX, JPG, JPEG, PNG files are allowed'));
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// ✅ IMPORTANT: Order matters - specific routes before general ones

// Public route - Submit application (for frontend)
router.post('/', upload.single('document'), careerController.submitApplication);

// Bulk operations (must come before /:id routes)
router.post('/bulk-delete', protect, careerController.bulkDeleteApplications);
router.post('/bulk-update-status', protect, careerController.bulkUpdateStatus);

// Admin routes - Protected
router.get('/', protect, careerController.getAllApplications);
router.get('/:id', protect, careerController.getApplicationById);
router.patch('/:id/status', protect, careerController.updateApplicationStatus);
router.delete('/:id', protect, careerController.deleteApplication);

module.exports = router;