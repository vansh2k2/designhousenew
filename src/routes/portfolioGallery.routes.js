const express = require("express");
const router = express.Router();
const portfolioGalleryController = require("../controllers/portfolioGallery.controller");
const upload = require("../middleware/upload.middleware");

// Create Gallery Category (Main Entry)
router.post(
    "/create",
    upload.single("mainImage"),
    portfolioGalleryController.createGalleryCategory
);

// Add Gallery Images
router.post(
    "/add-images",
    upload.array("images", 10), // Allow up to 10 images at once
    portfolioGalleryController.addGalleryImages
);

// Get All (Admin)
router.get("/all", portfolioGalleryController.getAllGalleries);

// Get Single by Slug
router.get("/:slug", portfolioGalleryController.getGalleryBySlug);

// Delete Gallery
router.delete("/delete/:id", portfolioGalleryController.deleteGallery);

module.exports = router;
