const multer = require('multer');
const path = require('path');
const fs = require('fs');

// ==================== STORAGE CONFIGURATION ====================
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Determine upload directory based on route
    let uploadDir = 'uploads/';

    if (req.baseUrl.includes('/blog')) {
      uploadDir = 'uploads/blogs/';
    } else if (req.baseUrl.includes('/hero')) {
      uploadDir = 'uploads/hero/';
    } else if (req.baseUrl.includes('/client')) {
      uploadDir = 'uploads/clients/';
    } else if (req.baseUrl.includes('/about')) {
      uploadDir = 'uploads/about/';
    } else if (req.baseUrl.includes('/testimonial')) {
      uploadDir = 'uploads/testimonials/';
    } else if (req.baseUrl.includes('/career')) {
      uploadDir = 'uploads/careers/';
    } else if (req.baseUrl.includes('/how-we-work')) {
      uploadDir = 'uploads/how-we-work/';
    } else if (req.baseUrl.includes('/portfolio-gallery')) {
      // Check fieldname for gallery images vs hero image
      if (file.fieldname === 'images') {
        uploadDir = 'uploads/portfolio/gallery/';
      } else {
        uploadDir = 'uploads/portfolio/';
      }
    }

    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Create unique filename: timestamp-randomNumber-originalname
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const nameWithoutExt = path.basename(file.originalname, ext);
    const sanitizedName = nameWithoutExt.replace(/[^a-zA-Z0-9]/g, '-');
    cb(null, `${sanitizedName}-${uniqueSuffix}${ext}`);
  }
});

// ==================== FILE FILTER ====================
const fileFilter = (req, file, cb) => {
  // Allowed image types
  const allowedImageTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml'
  ];

  // Allowed document types (if needed for career/applications)
  const allowedDocTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];

  const allAllowedTypes = [...allowedImageTypes, ...allowedDocTypes];

  if (allAllowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only images (JPEG, PNG, GIF, WebP, SVG) and documents (PDF, DOC, DOCX) are allowed.'), false);
  }
};

// ==================== MULTER CONFIGURATION ====================
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// ==================== ERROR HANDLING MIDDLEWARE ====================
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: '❌ File size too large. Maximum allowed size is 100KB. Please compress your image and try again.'
      });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Too many files uploaded.'
      });
    }
    return res.status(400).json({
      success: false,
      message: `Upload error: ${err.message}`
    });
  } else if (err) {
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }
  next();
};

// ==================== HELPER FUNCTIONS ====================

/**
 * Delete file from filesystem
 * @param {string} filePath - Relative path to file
 */
const deleteFile = async (filePath) => {
  try {
    if (filePath) {
      const fullPath = path.join(__dirname, '../../', filePath);
      if (fs.existsSync(fullPath)) {
        await fs.promises.unlink(fullPath);
        console.log(`✅ File deleted: ${filePath}`);
        return true;
      }
    }
    return false;
  } catch (error) {
    console.error('Error deleting file:', error);
    return false;
  }
};

/**
 * Delete multiple files from filesystem
 * @param {Array} filePaths - Array of relative file paths
 */
const deleteFiles = async (filePaths) => {
  try {
    const deletePromises = filePaths.map(filePath => deleteFile(filePath));
    await Promise.all(deletePromises);
    console.log(`✅ ${filePaths.length} files deleted`);
    return true;
  } catch (error) {
    console.error('Error deleting multiple files:', error);
    return false;
  }
};

/**
 * Get file size in human-readable format
 * @param {number} bytes - File size in bytes
 */
const getFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

/**
 * Validate image dimensions (if needed)
 * @param {string} filePath - Path to image file
 */
const validateImageDimensions = async (filePath, maxWidth = 5000, maxHeight = 5000) => {
  try {
    const sharp = require('sharp');
    const metadata = await sharp(filePath).metadata();

    if (metadata.width > maxWidth || metadata.height > maxHeight) {
      return {
        valid: false,
        message: `Image dimensions too large. Maximum: ${maxWidth}x${maxHeight}px`
      };
    }

    return {
      valid: true,
      width: metadata.width,
      height: metadata.height
    };
  } catch (error) {
    console.error('Error validating image dimensions:', error);
    return {
      valid: true // Allow upload if validation fails
    };
  }
};

// ==================== EXPORTS ====================
module.exports = upload;
module.exports.handleMulterError = handleMulterError;
module.exports.deleteFile = deleteFile;
module.exports.deleteFiles = deleteFiles;
module.exports.getFileSize = getFileSize;
module.exports.validateImageDimensions = validateImageDimensions;

// ==================== USAGE EXAMPLES ====================
/*

// Single file upload
router.post('/upload', upload.single('image'), controller.uploadImage);

// Multiple files upload (max 5)
router.post('/upload-multiple', upload.array('images', 5), controller.uploadImages);

// Multiple fields
router.post('/upload-mixed', upload.fields([
  { name: 'avatar', maxCount: 1 },
  { name: 'gallery', maxCount: 5 }
]), controller.uploadMixed);

// With error handling
router.post('/upload',
  upload.single('image'),
  handleMulterError,
  controller.uploadImage
);

// Delete file example in controller:
const { deleteFile } = require('../middleware/upload.middleware');
await deleteFile('uploads/about/image-123456.jpg');

*/