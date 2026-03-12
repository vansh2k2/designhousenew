const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const {
  createBlog,
  getAllBlogs,
  getPublishedBlogs,
  getBlogById,
  getBlogBySlug,
  getRelatedBlogs,
  updateBlog,
  deleteBlog,
  getBlogCategories,
  getBlogStats,
} = require("../controllers/blog.controller");

// ================= UPLOADS DIRECTORY =================
const uploadDir = path.join(__dirname, "../../uploads/blogs");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// ================= MULTER CONFIG =================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName =
      Date.now() + "-" + Math.random().toString(36).substring(2);
    const ext = path.extname(file.originalname);
    cb(null, `blog-${uniqueName}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

// ================= LOG MIDDLEWARE =================
const logMiddleware = (req, res, next) => {
  console.log(`📨 ${req.method} ${req.originalUrl}`);
  next();
};

// ================= PUBLIC ROUTES =================
router.get("/published", getPublishedBlogs);
router.get("/categories", getBlogCategories);
router.get("/slug/:slug", getBlogBySlug);
router.get("/slug/:slug/related", getRelatedBlogs);
router.get("/:id", getBlogById);

// ================= ADMIN ROUTES =================
router.get("/stats", getBlogStats);
router.get("/admin/all", getAllBlogs);
router.delete("/:id", deleteBlog);

// ================= CREATE & UPDATE =================
router.post(
  "/",
  logMiddleware,
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "ogImage", maxCount: 1 }
  ]),
  createBlog
);

router.patch(
  "/:id",
  logMiddleware,
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "ogImage", maxCount: 1 }
  ]),
  updateBlog
);

module.exports = router;
