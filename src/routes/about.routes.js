const express = require("express");
const router = express.Router();

const aboutController = require('../controllers/about.controller');

const { protect } = require("../middleware/auth.middleware");
const upload = require("../middleware/upload.middleware");

// ======================
// 🌐 PUBLIC (WEBSITE)
// ======================
router.get("/", aboutController.getAboutPage);

// ======================
// 🔐 ADMIN
// ======================
router.get("/admin", protect, aboutController.getAboutPageForAdmin);

// ======================
// 🔐 FULL PAGE SAVE
// ======================
router.post("/", protect, aboutController.createOrUpdateAboutPage);

// ======================
// 🔥 SECTIONS
// ======================
router.post("/sections", protect, aboutController.addSection);
router.put("/sections/:sectionId", protect, aboutController.updateSection);
router.delete("/sections/:sectionId", protect, aboutController.deleteSection);

// ======================
// 🔥 DESCRIPTION BOXES
// ======================
router.post("/description-boxes", protect, aboutController.addDescriptionBox);
router.put("/description-boxes/:boxId", protect, aboutController.updateDescriptionBox);
router.delete("/description-boxes/:boxId", protect, aboutController.deleteDescriptionBox);

// ======================
// 🔥 IMAGE UPLOAD (THIS WAS MISSING ❌)
// ======================
router.post(
  "/images",
  protect,
  upload.single("image"),
  aboutController.uploadImage
);

// ======================
// 🔥 DELETE IMAGE
// ======================
router.delete(
  "/images/:imageId",
  protect,
  aboutController.deleteImage
);

// ======================
// 🔥 VIDEOS
// ======================
router.post("/videos", protect, aboutController.addVideo);
router.delete("/videos/:videoId", protect, aboutController.deleteVideo);

module.exports = router;
