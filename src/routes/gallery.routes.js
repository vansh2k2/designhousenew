const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const {
    createCategory,
    getCategories,
    updateCategory,
    deleteCategory,
    createGalleryItem,
    getGalleryItems,
    getGalleryItemById,
    updateGalleryItem,
    deleteGalleryItem,
    uploadGalleryImages,
    getGalleryImagesByItem,
    getAllGalleryImages
} = require("../controllers/gallery.controller");

// ================= UPLOADS DIRECTORY =================
const uploadDir = path.join(__dirname, "../../uploads/gallery");

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// ================= MULTER CONFIG =================
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueName = Date.now() + "-" + Math.random().toString(36).substring(2, 9);
        const ext = path.extname(file.originalname);
        cb(null, `gallery-${uniqueName}${ext}`);
    },
});

const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

// ================= LOG MIDDLEWARE =================
const logMiddleware = (req, res, next) => {
    console.log(`📨 gallery: ${req.method} ${req.originalUrl}`);
    next();
};

/* ================= CATEGORY ROUTES ================= */
router.post("/categories", createCategory);
router.get("/categories", getCategories);
router.put("/categories/:id", updateCategory);
router.delete("/categories/:id", deleteCategory);

/* ================= ITEM ROUTES ================= */
router.post("/items", logMiddleware, upload.single("mainImage"), createGalleryItem);
router.get("/items", getGalleryItems);
router.get("/items/:id", getGalleryItemById);
router.put("/items/:id", upload.single("mainImage"), updateGalleryItem);
router.delete("/items/:id", deleteGalleryItem);

/* ================= GALLERY IMAGES ROUTES ================= */
router.post("/images", logMiddleware, upload.array("images", 6), uploadGalleryImages);
router.get("/images/:itemId", getGalleryImagesByItem);
router.get("/images", getAllGalleryImages);

module.exports = router;
