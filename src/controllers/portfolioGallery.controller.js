const PortfolioGallery = require("../models/PortfolioGallery.model");
const { logActivity } = require("./activityLog.controller");
const fs = require("fs");
const path = require("path");

// ✅ CREATE GALLERY CATEGORY (Parent Entry)
exports.createGalleryCategory = async (req, res) => {
    try {
        const {
            category,
            subCategory,
            title,
            highlightText,
            bannerTitle,
            bannerHighlightText,
            displayNumber,
            slug,
            altText,
            heroImageAltText,
            description,
            galleryAltTexts, // JSON string of array
        } = req.body;

        const files = req.files || {};
        const heroImageFile = files['heroImage'] ? files['heroImage'][0] : null;

        const heroImagePath = heroImageFile 
            ? `/uploads/portfolio/${heroImageFile.filename}` 
            : "";
        
        const galleryImagesFiles = files['images'] || [];
        const parsedGalleryAltTexts = galleryAltTexts ? JSON.parse(galleryAltTexts) : [];

        const galleryImages = galleryImagesFiles.map((file, index) => ({
            image: `/uploads/portfolio/gallery/${file.filename}`,
            altText: parsedGalleryAltTexts[index] || "Portfolio Gallery Image",
        }));

        const newGallery = await PortfolioGallery.create({
            category,
            subCategory,
            title,
            highlightText,
            bannerTitle,
            bannerHighlightText,
            displayNumber,
            slug: slug || title.toLowerCase().replace(/ /g, "-"),
            heroImage: heroImagePath,
            mainImage: heroImagePath, // Sync mainImage for compatibility
            altText: altText || title,
            heroImageAltText: heroImageAltText || "",
            description: description || "",
            galleryImages: galleryImages,
            updatedBy: req.body.updatedBy || "Admin User"
        });

        await logActivity(req.body.updatedBy || "Admin User", "Created", "Portfolio Gallery", `Created gallery: ${title}`);

        res.status(201).json({
            success: true,
            message: "Gallery Category Created Successfully",
            data: newGallery,
        });
    } catch (error) {
        if (req.files) { Object.values(req.files).flat().forEach(file => { if (fs.existsSync(file.path)) fs.unlinkSync(file.path); }); }
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// ✅ ADD GALLERY IMAGES (Child Entries)
exports.addGalleryImages = async (req, res) => {
    try {
        const { galleryId, altTexts } = req.body;
        // altTexts will be a JSON string of array -> ["alt1", "alt2"] matching files order

        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                success: false,
                message: "At least one image is required",
            });
        }

        const gallery = await PortfolioGallery.findById(galleryId);
        if (!gallery) {
            req.files.forEach((file) => fs.unlinkSync(file.path));
            return res.status(404).json({
                success: false,
                message: "Gallery not found",
            });
        }

        const parsedAltTexts = altTexts ? JSON.parse(altTexts) : [];

        const newImages = req.files.map((file, index) => ({
            image: `/uploads/portfolio/gallery/${file.filename}`,
            altText: parsedAltTexts[index] || "Portfolio Gallery Image",
        }));

        gallery.galleryImages.push(...newImages);
        const updatedBy = req.body.updatedBy || "Admin User";
        gallery.updatedBy = updatedBy;
        await gallery.save();

        await logActivity(updatedBy, "Updated (Added Images)", "Portfolio Gallery", `Added ${newImages.length} images to gallery: ${gallery.title}`);

        res.status(200).json({
            success: true,
            message: `${newImages.length} Images Added Successfully`,
            data: gallery,
        });
    } catch (error) {
        if (req.files) {
            req.files.forEach((file) => {
                if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
            });
        }
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// ✅ GET ALL GALLERIES (For Admin)
exports.getAllGalleries = async (req, res) => {
    try {
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        const galleries = await PortfolioGallery.find().sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            data: galleries,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// ✅ GET BY SLUG (For Frontend - Future Use)
exports.getGalleryBySlug = async (req, res) => {
    try {
        const gallery = await PortfolioGallery.findOne({
            slug: req.params.slug,
            status: "Active",
        });

        if (!gallery) {
            return res.status(404).json({
                success: false,
                message: "Gallery not found",
            });
        }

        res.status(200).json({
            success: true,
            data: gallery,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// ✅ GET SINGLE BY ID (For Admin Edit)
exports.getGalleryById = async (req, res) => {
    try {
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        const gallery = await PortfolioGallery.findById(req.params.id);
        if (!gallery) {
            return res.status(404).json({
                success: false,
                message: "Gallery not found",
            });
        }
        res.status(200).json({
            success: true,
            data: gallery,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// ✅ UPDATE GALLERY CATEGORY
exports.updateGalleryCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            category,
            subCategory,
            title,
            highlightText,
            bannerTitle,
            bannerHighlightText,
            displayNumber,
            slug,
            altText,
            heroImageAltText,
            status,
            description,
            galleryAltTexts, // JSON string of array
        } = req.body;

        const gallery = await PortfolioGallery.findById(id);
        if (!gallery) {
            if (req.files) {
                Object.values(req.files).flat().forEach(file => fs.unlinkSync(file.path));
            }
            return res.status(404).json({
                success: false,
                message: "Gallery not found",
            });
        }

        const files = req.files || {};
        const heroImageFile = files['heroImage'] ? files['heroImage'][0] : null;

        let heroImagePath = gallery.heroImage;

        // If new hero image uploaded, replace old one
        if (heroImageFile) {
            if (gallery.heroImage) {
                const oldHeroPath = path.join(__dirname, "../../", gallery.heroImage.replace(/^\//, ""));
                if (fs.existsSync(oldHeroPath)) fs.unlinkSync(oldHeroPath);
            }
            heroImagePath = `/uploads/portfolio/${heroImageFile.filename}`;
        }

        const galleryImagesFiles = files['images'] || [];
        const parsedGalleryAltTexts = galleryAltTexts ? JSON.parse(galleryAltTexts) : [];

        const newGalleryImages = galleryImagesFiles.map((file, index) => ({
            image: `/uploads/portfolio/gallery/${file.filename}`,
            altText: parsedGalleryAltTexts[index] || "Portfolio Gallery Image",
        }));

        const updatedData = {
            category,
            subCategory,
            title,
            highlightText,
            bannerTitle,
            bannerHighlightText,
            displayNumber,
            slug: slug || gallery.slug,
            heroImage: heroImagePath,
            mainImage: heroImagePath, // Sync mainImage for compatibility
            altText: altText || title,
            heroImageAltText: heroImageAltText || gallery.heroImageAltText,
            description: description !== undefined ? description : gallery.description,
            status: status || gallery.status,
            updatedBy: req.body.updatedBy || "Admin User",
        };

        if (newGalleryImages.length > 0) {
            updatedData.galleryImages = [...gallery.galleryImages, ...newGalleryImages];
        }

        const updatedGallery = await PortfolioGallery.findByIdAndUpdate(
            id,
            updatedData,
            { new: true }
        );

        await logActivity(req.body.updatedBy || "Admin User", "Updated", "Portfolio Gallery", `Updated gallery: ${title}`);

        res.status(200).json({
            success: true,
            message: "Gallery Updated Successfully",
            data: updatedGallery,
        });
    } catch (error) {
        if (req.files) { Object.values(req.files).flat().forEach(file => { if (fs.existsSync(file.path)) fs.unlinkSync(file.path); }); }
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// ✅ DELETE INDIVIDUAL IMAGE FROM GALLERY
exports.deleteImageFromGallery = async (req, res) => {
    try {
        const { galleryId, imageId } = req.body;

        const gallery = await PortfolioGallery.findById(galleryId);
        if (!gallery) {
            return res.status(404).json({ success: false, message: "Gallery not found" });
        }

        const imageToRemove = gallery.galleryImages.id(imageId);
        if (!imageToRemove) {
            return res.status(404).json({ success: false, message: "Image not found in gallery" });
        }

        // Delete File
        const imgPath = path.join(__dirname, "../../", imageToRemove.image.replace(/^\//, ""));
        if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);

        // Remove from Array
        gallery.galleryImages.pull(imageId);
        const updatedBy = req.body.updatedBy || "Admin User";
        gallery.updatedBy = updatedBy;
        await gallery.save();

        await logActivity(updatedBy, "Updated (Deleted Image)", "Portfolio Gallery", `Deleted an image from gallery: ${gallery.title}`);

        res.status(200).json({
            success: true,
            message: "Image deleted successfully",
            data: gallery
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ✅ UPDATE IMAGE ALT TEXT
exports.updateImageAltText = async (req, res) => {
    try {
        const { galleryId, imageId, altText } = req.body;

        const gallery = await PortfolioGallery.findById(galleryId);
        if (!gallery) {
            return res.status(404).json({ success: false, message: "Gallery not found" });
        }

        const imageToUpdate = gallery.galleryImages.id(imageId);
        if (!imageToUpdate) {
            return res.status(404).json({ success: false, message: "Image not found in gallery" });
        }

        imageToUpdate.altText = altText;
        const updatedBy = req.body.updatedBy || "Admin User";
        gallery.updatedBy = updatedBy;
        await gallery.save();

        await logActivity(updatedBy, "Updated (Alt Text)", "Portfolio Gallery", `Updated image alt text in gallery: ${gallery.title}`);

        res.status(200).json({
            success: true,
            message: "Alt text updated successfully",
            data: gallery
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ✅ REPLACE IMAGE IN GALLERY
exports.replaceImageInGallery = async (req, res) => {
    try {
        const { galleryId, imageId } = req.body;
        
        if (!req.file) {
            return res.status(400).json({ success: false, message: "New image is required" });
        }

        const gallery = await PortfolioGallery.findById(galleryId);
        if (!gallery) {
            if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
            return res.status(404).json({ success: false, message: "Gallery not found" });
        }

        const imageToReplace = gallery.galleryImages.id(imageId);
        if (!imageToReplace) {
            if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
            return res.status(404).json({ success: false, message: "Image not found in gallery" });
        }

        // Delete Old File
        const oldPath = path.join(__dirname, "../../", imageToReplace.image.replace(/^\//, ""));
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);

        // Update with New File
        imageToReplace.image = `/uploads/portfolio/gallery/${req.file.filename}`;
        const updatedBy = req.body.updatedBy || "Admin User";
        gallery.updatedBy = updatedBy;
        await gallery.save();

        await logActivity(updatedBy, "Updated (Replaced Image)", "Portfolio Gallery", `Replaced an image in gallery: ${gallery.title}`);

        res.status(200).json({
            success: true,
            message: "Image replaced successfully",
            data: gallery
        });
    } catch (error) {
        if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        res.status(500).json({ success: false, message: error.message });
    }
};

// ✅ DELETE GALLERY
exports.deleteGallery = async (req, res) => {
    try {
        const gallery = await PortfolioGallery.findById(req.params.id);
        if (!gallery) {
            return res.status(404).json({
                success: false,
                message: "Gallery not found",
            });
        }

        // No main image to delete

        // Delete Hero Image
        if (gallery.heroImage) {
            const heroImagePath = path.join(__dirname, "../../", gallery.heroImage.replace(/^\//, ""));
            if (fs.existsSync(heroImagePath)) fs.unlinkSync(heroImagePath);
        }

        // Delete Gallery Images
        gallery.galleryImages.forEach(img => {
            const imgPath = path.join(__dirname, "../../", img.image.replace(/^\//, ""));
            if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
        });

        const updatedBy = req.query.updatedBy || req.body.updatedBy || "Admin User";
        await PortfolioGallery.findByIdAndDelete(req.params.id);

        await logActivity(updatedBy, "Deleted", "Portfolio Gallery", `Deleted gallery: ${gallery.title}`);

        res.status(200).json({
            success: true,
            message: "Gallery deleted successfully",
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
// ✅ GET LATEST BANNER FOR A CATEGORY
exports.getCategoryBanner = async (req, res) => {
    try {
        const { category, subCategory } = req.query;
        let query = { category };
        if (subCategory && subCategory !== "null" && subCategory !== "undefined") {
            query.subCategory = subCategory;
        }

        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        // Find the most recent gallery in this category that has a hero image
        const gallery = await PortfolioGallery.findOne({ 
            ...query, 
            heroImage: { $exists: true, $ne: "" },
            status: "Active"
        }).sort({ createdAt: -1 });

        if (!gallery) {
            return res.status(404).json({
                success: false,
                message: "No banner found for this category"
            });
        }

        res.status(200).json({
            success: true,
            data: {
                bannerTitle: gallery.bannerTitle,
                bannerHighlightText: gallery.bannerHighlightText,
                heroImage: gallery.heroImage,
                heroImageAltText: gallery.heroImageAltText,
                description: gallery.description || ""
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ✅ GET ALL IMAGES BY CATEGORY/SUBCATEGORY
exports.getImagesByCategory = async (req, res) => {
  try {
    const { category, subCategory } = req.query;
    let query = { category };
    if (subCategory && subCategory !== "null" && subCategory !== "undefined" && subCategory !== "") {
      query.subCategory = subCategory;
    }

    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    const galleries = await PortfolioGallery.find({ 
      ...query, 
      status: "Active" 
    }).sort({ displayNumber: 1, createdAt: -1 });

    // Flatten all gallery images into one array
    let allImages = [];
    galleries.forEach(gallery => {
      if (gallery.galleryImages && gallery.galleryImages.length > 0) {
        gallery.galleryImages.forEach(img => {
          allImages.push({
            id: img._id,
            url: img.image,
            altText: img.altText || gallery.title,
            galleryTitle: gallery.title
          });
        });
      }
    });

    res.status(200).json({
      success: true,
      data: allImages
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
