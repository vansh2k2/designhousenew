const PortfolioGallery = require("../models/PortfolioGallery.model");
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
            description,
            displayNumber,
            buttonLabel,
            buttonUrl,
            slug,
            altText,
        } = req.body;

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Main Image is required",
            });
        }

        const mainImagePath = `/uploads/portfolio/${req.file.filename}`;

        const newGallery = await PortfolioGallery.create({
            category,
            subCategory,
            title,
            highlightText,
            description,
            displayNumber,
            buttonLabel,
            buttonUrl, // Custom slug/url provided by admin
            slug: slug || title.toLowerCase().replace(/ /g, "-"),
            mainImage: mainImagePath,
            altText: altText || title,
        });

        res.status(201).json({
            success: true,
            message: "Gallery Category Created Successfully",
            data: newGallery,
        });
    } catch (error) {
        if (req.file) fs.unlinkSync(req.file.path);
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
        await gallery.save();

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

        // Delete Main Image
        const mainImagePath = path.join(__dirname, "../../", gallery.mainImage);
        if (fs.existsSync(mainImagePath)) fs.unlinkSync(mainImagePath);

        // Delete Gallery Images
        gallery.galleryImages.forEach(img => {
            const imgPath = path.join(__dirname, "../../", img.image);
            if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
        });

        await PortfolioGallery.findByIdAndDelete(req.params.id);

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
