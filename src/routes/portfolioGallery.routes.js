const express = require("express");
const router = express.Router();
const portfolioGalleryController = require("../controllers/portfolioGallery.controller");
const { handleMulterError } = require("../middleware/upload.middleware");
const upload = require("../middleware/upload.middleware");

// Create Gallery Category (Main Entry)
router.post(
    "/create",
    upload.fields([
        { name: "mainImage", maxCount: 1 },
        { name: "heroImage", maxCount: 1 },
        { name: "images", maxCount: 100 },
    ]),
    handleMulterError,
    portfolioGalleryController.createGalleryCategory
);

// Get Category Banner (Dynamic Hero)
router.get("/category-banner", portfolioGalleryController.getCategoryBanner);

// Get All Images by Category (New unified view)
router.get("/get-images", portfolioGalleryController.getImagesByCategory);

// Add Gallery Images
router.post(
    "/add-images",
    upload.array("images", 100), // Allow up to 100 images at once
    handleMulterError,
    portfolioGalleryController.addGalleryImages
);

// Get All (Admin)
router.get("/all", portfolioGalleryController.getAllGalleries);

// Get Single by ID (Admin)
router.get("/id/:id", portfolioGalleryController.getGalleryById);

// Update Gallery Category
router.put(
    "/update/:id",
    upload.fields([
        { name: "mainImage", maxCount: 1 },
        { name: "heroImage", maxCount: 1 },
        { name: "images", maxCount: 100 },
    ]),
    handleMulterError,
    portfolioGalleryController.updateGalleryCategory
);

// Delete Individual Image
router.post("/delete-image", portfolioGalleryController.deleteImageFromGallery);

// Update Individual Image Alt Text
router.post("/update-image-alt", portfolioGalleryController.updateImageAltText);

// Replace Individual Image
router.post(
    "/replace-image",
    upload.single("image"),
    handleMulterError,
    portfolioGalleryController.replaceImageInGallery
);

// Get Single by Slug (Frontend)
router.get("/:slug", portfolioGalleryController.getGalleryBySlug);

// Delete Gallery
router.delete("/delete/:id", portfolioGalleryController.deleteGallery);

module.exports = router;
