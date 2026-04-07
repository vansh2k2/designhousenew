const CustomPage = require("../models/CustomPage.model");
const { logActivity } = require('./activityLog.controller');
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
            let alts = [];
            let indices = [];
            
            try {
                alts = galleryAlts ? JSON.parse(galleryAlts) : [];
                indices = req.body.galleryImageIndices ? JSON.parse(req.body.galleryImageIndices) : [];
            } catch (e) {
                // Fallback for non-JSON or missing data
                alts = Array.isArray(galleryAlts) ? galleryAlts : [galleryAlts];
                indices = req.files.galleryImages.map((_, i) => i);
            }

            req.files.galleryImages.forEach((file, i) => {
                const slotIndex = indices[i] !== undefined ? indices[i] : i;
                galleryImages.push({
                    url: `/uploads/custom-pages/${file.filename}`,
                    altTag: alts[slotIndex] || ""
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
            status: status || "inactive",
            updatedBy: req.body.updatedBy || "Admin User"
        };

        const page = await CustomPage.create(pageData);
        await logActivity(req.body.updatedBy || "Admin User", "Created", "Custom Page", `Created page: ${page.title}`);
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
            // Flexible match: Case-insensitive and optional trailing 's'
            const baseCategory = category.trim().replace(/s$/i, "");
            query.serviceCategory = { $regex: new RegExp(`^${baseCategory}s?$`, "i") };
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

        // Handle gallery update
        let alts = [];
        let existingUrls = [];
        let indices = [];

        try {
            alts = updates.galleryAlts ? JSON.parse(updates.galleryAlts) : [];
            existingUrls = updates.existingGalleryUrls ? JSON.parse(updates.existingGalleryUrls) : [];
            indices = updates.galleryImageIndices ? JSON.parse(updates.galleryImageIndices) : [];
        } catch (e) {
            // Fallback for non-JSON or missing data
            alts = Array.isArray(updates.galleryAlts) ? updates.galleryAlts : [updates.galleryAlts];
            existingUrls = page.galleryImages.map(img => img.url);
            indices = req.files && req.files.galleryImages ? req.files.galleryImages.map((_, i) => i) : [];
        }

        // Temporary array for up to 4 potential slots
        let updatedGallery = [null, null, null, null];

        // 1. Fill in existing images
        existingUrls.forEach((url, i) => {
            if (url && i < 4) {
                updatedGallery[i] = {
                    url: url.startsWith('/') ? url : '/' + url,
                    altTag: alts[i] || ""
                };
            }
        });

        // 2. Fill in new uploads
        if (req.files && req.files.galleryImages) {
            req.files.galleryImages.forEach((file, i) => {
                const slotIndex = indices[i];
                if (slotIndex !== undefined && slotIndex < 4) {
                    updatedGallery[slotIndex] = {
                        url: `/uploads/custom-pages/${file.filename}`,
                        altTag: alts[slotIndex] || ""
                    };
                }
            });
        }

        // 3. Delete files for images that were removed or replaced
        const currentUrls = page.galleryImages.map(img => img.url);
        const nextUrls = updatedGallery.filter(img => img !== null).map(img => img.url);
        
        currentUrls.forEach(oldUrl => {
            if (!nextUrls.includes(oldUrl)) {
                const oldPath = path.join(__dirname, "../../", oldUrl.replace(/^\//, ""));
                if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
            }
        });

        page.galleryImages = updatedGallery.filter(img => img !== null);

        // Update simple fields
        const fields = ['title', 'highlightedTitle', 'shortDescription', 'postDescription', 'permalink', 'serviceCategory', 'location', 'status', 'updatedBy'];
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
        await logActivity(updates.updatedBy || "Admin User", "Updated", "Custom Page", `Updated page: ${page.title}`);
        res.status(200).json({ success: true, data: page });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// DELETE PAGE
exports.deletePage = async (req, res) => {
    try {
        const updatedBy = req.query.updatedBy || req.body.updatedBy || "Admin User";
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
        await logActivity(updatedBy, "Deleted", "Custom Page", `Deleted page: ${page.title}`);
        res.status(200).json({ success: true, message: "Page deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
