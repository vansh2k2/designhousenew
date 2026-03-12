const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const serviceDetailController = require('../controllers/serviceDetail.controller');
const { protect, adminOnly } = require('../middleware/auth.middleware');

// ================= UPLOADS DIRECTORY =================
const uploadDir = path.join(__dirname, "../../uploads/service-details");

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// ================= MULTER CONFIG =================
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueName = Date.now() + "-" + Math.random().toString(36).substring(2);
        const ext = path.extname(file.originalname);
        cb(null, `${file.fieldname}-${uniqueName}${ext}`);
    },
});

const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

// Configure upload for multiple fields
const uploadFields = upload.fields([
    { name: 'bgImage', maxCount: 1 },
    { name: 'ogImage', maxCount: 1 },
    { name: 'galleryImages', maxCount: 4 }
]);

// ================= PUBLIC ROUTES =================
router.get("/", serviceDetailController.getAllServiceDetails);
router.get("/:name", serviceDetailController.getServiceDetailByName);

// ================= ADMIN ROUTES =================
router.post("/", protect, adminOnly, uploadFields, serviceDetailController.upsertServiceDetail);
router.delete("/:id", protect, adminOnly, serviceDetailController.deleteServiceDetail);

module.exports = router;
