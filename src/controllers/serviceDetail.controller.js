const ServiceDetail = require('../models/ServiceDetail.model');
const { logActivity } = require('./activityLog.controller');
const path = require('path');
const fs = require('fs');

// @desc    Upsert service detail
// @route   POST /api/service-details
// @access  Private/Admin
exports.upsertServiceDetail = async (req, res) => {
    try {
        const {
            serviceName,
            bgAltText,
            bgTitle,
            bgHighlightTitle,
            title,
            highlightText,
            description,
            metaTitle,
            metaKeywords,
            metaDescription,
            ogTitle,
            ogDescription,
            canonicalTag,
            schemaMarkup,
            openGraphTags,
            ogImageAltText,
            galleryAlts
        } = req.body;

        if (!serviceName) {
            return res.status(400).json({ success: false, message: 'Service name is required' });
        }

        let serviceDetail = await ServiceDetail.findOne({ serviceName });

        const updates = {
            serviceName,
            bgAltText,
            bgTitle,
            bgHighlightTitle,
            title,
            highlightText,
            description,
            seo: {
                metaTitle,
                metaKeywords,
                metaDescription,
                ogTitle,
                ogDescription,
                canonicalTag,
                schemaMarkup,
                openGraphTags,
                ogImageAltText
            },
            updatedBy: req.body.updatedBy || "Admin User"
        };

        // Handle Background Image
        if (req.files && req.files.bgImage) {
            if (serviceDetail && serviceDetail.bgImage) {
                const oldPath = path.join(__dirname, '../../', serviceDetail.bgImage);
                if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
            }
            updates.bgImage = `/uploads/service-details/${req.files.bgImage[0].filename}`;
        } else if (serviceDetail) {
            updates.bgImage = serviceDetail.bgImage;
        } else if (req.body.existingBgImage) {
            // Fallback for copying from another service
            updates.bgImage = req.body.existingBgImage;
        }

        // Handle OG Image
        if (req.files && req.files.ogImage) {
            if (serviceDetail && serviceDetail.seo && serviceDetail.seo.ogImage) {
                const oldOgPath = path.join(__dirname, '../../', serviceDetail.seo.ogImage);
                if (fs.existsSync(oldOgPath)) fs.unlinkSync(oldOgPath);
            }
            updates.seo.ogImage = `/uploads/service-details/${req.files.ogImage[0].filename}`;
        } else if (serviceDetail && serviceDetail.seo) {
            updates.seo.ogImage = serviceDetail.seo.ogImage;
        } else if (req.body.existingOgImage) {
            // Fallback for copying
            updates.seo.ogImage = req.body.existingOgImage;
        }

        // Handle Gallery Images
        let galleryImages = serviceDetail ? serviceDetail.galleryImages : [];
        const alts = Array.isArray(galleryAlts) ? galleryAlts : [galleryAlts];

        if (req.files && req.files.galleryImages) {
            // Delete old gallery images if they were replaced
            if (serviceDetail && serviceDetail.galleryImages) {
                serviceDetail.galleryImages.forEach(img => {
                    const oldPath = path.join(__dirname, '../../', img.url);
                    if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
                });
            }

            galleryImages = req.files.galleryImages.map((file, index) => ({
                url: `/uploads/service-details/${file.filename}`,
                altText: alts[index] || ""
            }));
        } else if (serviceDetail) {
            // Update alts even if no new images
            galleryImages = serviceDetail.galleryImages.map((img, index) => ({
                url: img.url,
                altText: alts[index] !== undefined ? alts[index] : img.altText
            }));
        } else if (req.body.existingGalleryPaths) {
            // Fallback for copying gallery
            const existingPaths = Array.isArray(req.body.existingGalleryPaths)
                ? req.body.existingGalleryPaths
                : [req.body.existingGalleryPaths];

            galleryImages = existingPaths.map((url, index) => ({
                url,
                altText: alts[index] || ""
            }));
        }
        updates.galleryImages = galleryImages;

        let isUpdate = !!serviceDetail;
        
        if (serviceDetail) {
            serviceDetail = await ServiceDetail.findOneAndUpdate(
                { serviceName },
                updates,
                { new: true, runValidators: true }
            );
        } else {
            serviceDetail = await ServiceDetail.create(updates);
        }

        await logActivity(req.body.updatedBy || "Admin User", isUpdate ? "Updated" : "Created", "Service Detail", `${isUpdate ? 'Updated' : 'Created'} service detail for ${serviceName}`);

        res.status(200).json({
            success: true,
            message: 'Service detail saved successfully',
            data: serviceDetail
        });
    } catch (error) {
        console.error('Upsert service detail error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to save service detail',
            error: error.message
        });
    }
};

// @desc    Get service detail by name
// @route   GET /api/service-details/:name
// @access  Public
exports.getServiceDetailByName = async (req, res) => {
    try {
        const { name } = req.params;
        const serviceDetail = await ServiceDetail.findOne({ serviceName: name }).lean();

        if (!serviceDetail) {
            return res.status(404).json({
                success: false,
                message: 'Service detail not found'
            });
        }

        // Fetch related portfolio gallery images from the PortfolioGallery system
        const PortfolioGallery = require('../models/PortfolioGallery.model');

        // Name Mapping for discrepancies between Services and Portfolio Categories/Subcategories
        const serviceToPortfolioMap = {
            "Modular Wardrobe": "Wardrobe",
            "Modular Kitchen": "Kitchen",
            "Modular LCD Unit": "LCD Unit",
            "Dressing Table": "Dressing Table",
            "Sofas": "Sofas",
            "Shop In Shops": "Shop In Shops",
            "Office Chairs": "Chairs",
            "Modular Work Station": "Modular Work Station",
            "MD Cabin": "MD Cabin",
            "Exhibition & Events": "Exhibition & Events",
            "Retail Display Merchandising": "Retail Display Merchandising",
            "Chairs": "Chairs",
            "Acrylic Displays": "Acrylic Displays"
        };

        const targetName = serviceToPortfolioMap[name] || name;
        const cleanTerm = targetName.replace(/Images|Portfolio|Services/gi, '').trim();

        // Search for all matching galleries to accumulate images from different projects
        const relatedGalleries = await PortfolioGallery.find({
            $or: [
                { subCategory: targetName },
                { title: targetName },
                { category: targetName },
                { subCategory: new RegExp(cleanTerm, 'i') },
                { title: new RegExp(cleanTerm, 'i') },
                { category: new RegExp(cleanTerm, 'i') }
            ],
            status: "Active"
        }).lean();

        if (relatedGalleries && relatedGalleries.length > 0) {
            const allImages = [];
            const seenUrls = new Set();

            relatedGalleries.forEach(gallery => {
                // Add main image
                if (gallery.mainImage) {
                    const url = gallery.mainImage.replace(/\\/g, '/');
                    if (!seenUrls.has(url)) {
                        allImages.push({
                            url,
                            altText: gallery.altText || gallery.title
                        });
                        seenUrls.add(url);
                    }
                }

                // Add gallery images
                if (gallery.galleryImages && gallery.galleryImages.length > 0) {
                    gallery.galleryImages.forEach(img => {
                        const url = img.image.replace(/\\/g, '/');
                        if (!seenUrls.has(url)) {
                            allImages.push({
                                url,
                                altText: img.altText || gallery.title
                            });
                            seenUrls.add(url);
                        }
                    });
                }
            });

            serviceDetail.portfolioGalleryImages = allImages;
        }

        res.status(200).json({
            success: true,
            data: serviceDetail
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch service detail',
            error: error.message
        });
    }
};

// @desc    Get all service details
// @route   GET /api/service-details
// @access  Public
exports.getAllServiceDetails = async (req, res) => {
    try {
        const serviceDetails = await ServiceDetail.find().sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            data: serviceDetails
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch service details',
            error: error.message
        });
    }
};

// @desc    Delete service detail
// @route   DELETE /api/service-details/:id
// @access  Private/Admin
exports.deleteServiceDetail = async (req, res) => {
    try {
        const { id } = req.params;
        const updatedBy = req.query.updatedBy || req.body.updatedBy || "Admin User";
        const serviceDetail = await ServiceDetail.findById(id);

        if (!serviceDetail) {
            return res.status(404).json({
                success: false,
                message: 'Service detail not found'
            });
        }

        // Delete Background Image
        if (serviceDetail.bgImage) {
            const bgPath = path.join(__dirname, '../../', serviceDetail.bgImage);
            if (fs.existsSync(bgPath)) fs.unlinkSync(bgPath);
        }

        // Delete OG Image
        if (serviceDetail.seo && serviceDetail.seo.ogImage) {
            const ogPath = path.join(__dirname, '../../', serviceDetail.seo.ogImage);
            if (fs.existsSync(ogPath)) fs.unlinkSync(ogPath);
        }

        // Delete Gallery Images
        if (serviceDetail.galleryImages && serviceDetail.galleryImages.length > 0) {
            serviceDetail.galleryImages.forEach(img => {
                const imgPath = path.join(__dirname, '../../', img.url);
                if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
            });
        }

        await ServiceDetail.findByIdAndDelete(id);

        await logActivity(updatedBy, "Deleted", "Service Detail", `Deleted service detail for ${serviceDetail.serviceName}`);

        res.status(200).json({
            success: true,
            message: 'Service detail and associated images deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to delete service detail',
            error: error.message
        });
    }
};
