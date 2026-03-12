const CustomPage = require("../models/CustomPage.model");
const path = require("path");
const fs = require("fs");

// CREATE PAGE
exports.createPage = async (req, res) => {
    try {
        const {
            title,
            highlightedTitle,
            shortDescription,
            postDescription,
            permalink,
            serviceCategory,
            location,
            metaTitle,
            metaKeywords,
            metaKeyword,
            metaDescription,
            ogTitle,
            ogDescription,
            canonicalTag,
            schemaMarkup,
            openGraphTags,
            status,
            galleryAlts,
            mainAlt
        } = req.body;

        // Validate main image
        if (!req.files || !req.files.mainImage) {
            return res.status(400).json({ success: false, message: "Main image is required" });
        }

        const mainImageUrl = `/uploads/custom-pages/${req.files.mainImage[0].filename}`;

        // Handle gallery images
        const galleryImages = [];
        if (req.files.galleryImages) {
            const alts = Array.isArray(galleryAlts) ? galleryAlts : [galleryAlts];
            req.files.galleryImages.forEach((file, index) => {
                galleryImages.push({
                    url: `/uploads/custom-pages/${file.filename}`,
                    altTag: alts[index] || ""
                });
            });
        }

        const pageData = {
            title,
            highlightedTitle,
            shortDescription,
            postDescription,
            permalink,
            serviceCategory,
            location: location || "",
            mainImage: {
                url: mainImageUrl,
                altTag: mainAlt || ""
            },
            galleryImages,
            seo: {
                metaTitle,
                metaKeywords: metaKeywords || metaKeyword,
                metaDescription,
                ogTitle,
                ogDescription,
                ogImage: req.files.ogImage ? `/uploads/custom-pages/${req.files.ogImage[0].filename}` : "",
                canonicalTag,
                schemaMarkup,
                openGraphTags
            },
            status: status || "inactive"
        };

        const page = await CustomPage.create(pageData);
        res.status(201).json({ success: true, data: page });
    } catch (error) {
        console.error("Create page error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// GET ALL PAGES
exports.getAllPages = async (req, res) => {
    try {
        const pages = await CustomPage.find().sort("-createdAt");
        res.status(200).json({ success: true, data: pages });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// GET ACTIVE LOCATIONS
exports.getActiveLocations = async (req, res) => {
    try {
        const { category } = req.query;
        let query = { status: "active" };

        if (category) {
            query.serviceCategory = category;
        }

        const locations = await CustomPage.find(query)
            .select("title permalink location serviceCategory")
            .sort("-createdAt");
        res.status(200).json({ success: true, data: locations });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// GET PAGE BY SLUG
exports.getPageBySlug = async (req, res) => {
    try {
        const page = await CustomPage.findOne({ permalink: req.params.slug });
        if (!page) {
            return res.status(404).json({ success: false, message: "Page not found" });
        }

        // Increment views
        page.views += 1;
        await page.save();

        res.status(200).json({ success: true, data: page });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// UPDATE PAGE
exports.updatePage = async (req, res) => {
    try {
        const { id } = req.params;
        const page = await CustomPage.findById(id);
        if (!page) {
            return res.status(404).json({ success: false, message: "Page not found" });
        }

        const updates = req.body;

        // Handle main image update
        if (req.files && req.files.mainImage) {
            // Delete old image
            const oldPath = path.join(__dirname, "../../", page.mainImage.url);
            if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);

            page.mainImage.url = `/uploads/custom-pages/${req.files.mainImage[0].filename}`;
        }
        if (updates.mainAlt !== undefined) page.mainImage.altTag = updates.mainAlt;

        // Handle gallery update - for simplicity, we'll replace gallery if new images are sent
        // In a more complex app, we'd handle individual image deletions/adds
        if (req.files && req.files.galleryImages) {
            // Delete old gallery images
            page.galleryImages.forEach(img => {
                const oldPath = path.join(__dirname, "../../", img.url);
                if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
            });

            const alts = Array.isArray(updates.galleryAlts) ? updates.galleryAlts : [updates.galleryAlts];
            page.galleryImages = req.files.galleryImages.map((file, index) => ({
                url: `/uploads/custom-pages/${file.filename}`,
                altTag: alts[index] || ""
            }));
        }

        // Update simple fields
        const fields = ['title', 'highlightedTitle', 'shortDescription', 'postDescription', 'permalink', 'serviceCategory', 'location', 'status'];
        fields.forEach(field => {
            if (updates[field] !== undefined) page[field] = updates[field];
        });

        // Update SEO
        if (updates.metaTitle !== undefined) page.seo.metaTitle = updates.metaTitle;
        if (updates.metaKeywords !== undefined) page.seo.metaKeywords = updates.metaKeywords;
        if (updates.metaDescription !== undefined) page.seo.metaDescription = updates.metaDescription;
        if (updates.ogTitle !== undefined) page.seo.ogTitle = updates.ogTitle;
        if (updates.ogDescription !== undefined) page.seo.ogDescription = updates.ogDescription;
        if (updates.canonicalTag !== undefined) page.seo.canonicalTag = updates.canonicalTag;
        if (updates.schemaMarkup !== undefined) page.seo.schemaMarkup = updates.schemaMarkup;
        if (updates.openGraphTags !== undefined) page.seo.openGraphTags = updates.openGraphTags;

        // Handle OG Image update
        if (req.files && req.files.ogImage) {
            // Delete old ogImage
            if (page.seo.ogImage) {
                const oldOgPath = path.join(__dirname, "../../", page.seo.ogImage);
                if (fs.existsSync(oldOgPath)) fs.unlinkSync(oldOgPath);
            }
            page.seo.ogImage = `/uploads/custom-pages/${req.files.ogImage[0].filename}`;
        }

        await page.save();
        res.status(200).json({ success: true, data: page });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// DELETE PAGE
exports.deletePage = async (req, res) => {
    try {
        const page = await CustomPage.findById(req.params.id);
        if (!page) {
            return res.status(404).json({ success: false, message: "Page not found" });
        }

        // Delete images
        const imagesToDelete = [
            page.mainImage.url,
            ...page.galleryImages.map(img => img.url)
        ];

        if (page.seo.ogImage) {
            imagesToDelete.push(page.seo.ogImage);
        }

        imagesToDelete.forEach(imgUrl => {
            const fullPath = path.join(__dirname, "../../", imgUrl);
            if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
        });

        await page.deleteOne();
        res.status(200).json({ success: true, message: "Page deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
