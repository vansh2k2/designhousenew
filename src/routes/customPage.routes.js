const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const {
    createPage,
    getAllPages,
    getActiveLocations,
    getPageBySlug,
    updatePage,
    deletePage
} = require("../controllers/customPage.controller");

// ================= UPLOADS DIRECTORY =================
const uploadDir = path.join(__dirname, "../../uploads/custom-pages");

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
        cb(null, `page-${uniqueName}${ext}`);
    },
});

const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

// ================= PUBLIC ROUTES =================
router.get("/locations", getActiveLocations);
router.get("/slug/:slug", getPageBySlug);

// ================= ADMIN ROUTES =================
router.get("/", getAllPages);
router.post("/", upload.fields([
    { name: 'mainImage', maxCount: 1 },
    { name: 'galleryImages', maxCount: 4 },
    { name: 'ogImage', maxCount: 1 }
]), createPage);

router.put("/:id", upload.fields([
    { name: 'mainImage', maxCount: 1 },
    { name: 'galleryImages', maxCount: 4 },
    { name: 'ogImage', maxCount: 1 }
]), updatePage);

router.delete("/:id", deletePage);

module.exports = router;
