const PortfolioCategory = require("../models/PortfolioCategory.model");
const GalleryItem = require("../models/GalleryItem.model");
const GalleryImage = require("../models/GalleryImage.model");
const { logActivity } = require("./activityLog.controller");
const fs = require("fs");
const path = require("path");

/* ================= CATEGORY LOGIC ================= */

exports.createCategory = async (req, res) => {
    try {
        const { name, status } = req.body;
        const category = await PortfolioCategory.create({ name, status });
        
        await logActivity(req.body.updatedBy || "Admin User", "Created", "Portfolio Gallery", `Created category: ${name}`);
        res.status(201).json({ success: true, data: category });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getCategories = async (req, res) => {
    try {
        const categories = await PortfolioCategory.find().sort("name");
        res.status(200).json({ success: true, data: categories });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateCategory = async (req, res) => {
    try {
        const category = await PortfolioCategory.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.status(200).json({ success: true, data: category });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.deleteCategory = async (req, res) => {
    try {
        const updatedBy = req.query.updatedBy || req.body.updatedBy || "Admin User";
        const category = await PortfolioCategory.findById(req.params.id);
        await PortfolioCategory.findByIdAndDelete(req.params.id);
        
        if (category) {
            await logActivity(updatedBy, "Deleted", "Portfolio Gallery", `Deleted category: ${category.name}`);
        }
        res.status(200).json({ success: true, message: "Category deleted" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/* ================= ITEM LOGIC ================= */

exports.createGalleryItem = async (req, res) => {
    try {
        const {
            category,
            subcategory,
            title,
            highlightText,
            shortDescription,
            number,
            buttonText,
            buttonUrl,
            status,
            slug,
            mainImageAltText
        } = req.body;

        if (!req.file) {
            return res.status(400).json({ success: false, message: "Main image is required" });
        }

        const mainImageUrl = `/uploads/gallery/${req.file.filename}`;

        const finalSlug = slug || title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") + "-" + Date.now();

        const galleryItem = await GalleryItem.create({
            category,
            subcategory,
            title,
            highlightText,
            shortDescription,
            number,
            buttonText,
            buttonUrl,
            slug: finalSlug,
            mainImage: mainImageUrl,
            mainImageAltText,
            status
        });

        await logActivity(req.body.updatedBy || "Admin User", "Created", "Portfolio Gallery", `Created gallery item: ${title}`);

        res.status(201).json({ success: true, data: galleryItem });
    } catch (error) {
        if (req.file) fs.unlinkSync(req.file.path);
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getGalleryItems = async (req, res) => {
    try {
        const items = await GalleryItem.find().populate("category").sort("-createdAt");
        res.status(200).json({ success: true, data: items });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getGalleryItemById = async (req, res) => {
    try {
        const item = await GalleryItem.findById(req.params.id).populate("category");
        res.status(200).json({ success: true, data: item });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateGalleryItem = async (req, res) => {
    try {
        const item = await GalleryItem.findById(req.params.id);
        if (!item) return res.status(404).json({ success: false, message: "Item not found" });

        if (req.file) {
            // Delete old image
            const oldPath = path.join(__dirname, "../../", item.mainImage);
            if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
            item.mainImage = `/uploads/gallery/${req.file.filename}`;
        }

        Object.assign(item, req.body);
        await item.save();

        res.status(200).json({ success: true, data: item });
    } catch (error) {
        if (req.file) fs.unlinkSync(req.file.path);
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.deleteGalleryItem = async (req, res) => {
    try {
        const item = await GalleryItem.findById(req.params.id);
        if (item) {
            const imagePath = path.join(__dirname, "../../", item.mainImage);
            if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);

            // Also delete associated gallery images record and files
            const galleryImages = await GalleryImage.findOne({ galleryItem: item._id });
            if (galleryImages) {
                galleryImages.images.forEach(img => {
                    const p = path.join(__dirname, "../../", img.url);
                    if (fs.existsSync(p)) fs.unlinkSync(p);
                });
                await GalleryImage.deleteOne({ _id: galleryImages._id });
            }

            await GalleryItem.deleteOne({ _id: item._id });
        }
        
        const updatedBy = req.query.updatedBy || req.body.updatedBy || "Admin User";
        if (item) {
            await logActivity(updatedBy, "Deleted", "Portfolio Gallery", `Deleted gallery item: ${item.title}`);
        }
        res.status(200).json({ success: true, message: "Item deleted" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/* ================= GALLERY IMAGES LOGIC ================= */

exports.uploadGalleryImages = async (req, res) => {
    try {
        const { galleryItemId, altTexts } = req.body;
        const files = req.files;

        if (!files || files.length === 0) {
            return res.status(400).json({ success: false, message: "No images uploaded" });
        }

        const alts = JSON.parse(altTexts || "[]");

        const images = files.map((file, index) => ({
            url: `/uploads/gallery/${file.filename}`,
            altText: alts[index] || ""
        }));

        // Find if record exists for this item, if so, update or replace?
        // User said "uss title me m ab images add krunga m usme 6 images"
        // I'll replace or update the existing record.

        let galleryImage = await GalleryImage.findOne({ galleryItem: galleryItemId });

        if (galleryImage) {
            // Delete old files
            galleryImage.images.forEach(img => {
                const p = path.join(__dirname, "../../", img.url);
                if (fs.existsSync(p)) fs.unlinkSync(p);
            });
            galleryImage.images = images;
            await galleryImage.save();
        } else {
            galleryImage = await GalleryImage.create({
                galleryItem: galleryItemId,
                images
            });
        }

        res.status(200).json({ success: true, data: galleryImage });
    } catch (error) {
        if (req.files) {
            req.files.forEach(f => {
                if (fs.existsSync(f.path)) fs.unlinkSync(f.path);
            });
        }
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getGalleryImagesByItem = async (req, res) => {
    try {
        const images = await GalleryImage.findOne({ galleryItem: req.params.itemId });
        res.status(200).json({ success: true, data: images });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getAllGalleryImages = async (req, res) => {
    try {
        const images = await GalleryImage.find().populate("galleryItem");
        res.status(200).json({ success: true, data: images });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
