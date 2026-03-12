const Seo = require('../models/Seo.model');

// Create new SEO entry
exports.createSeo = async (req, res) => {
    try {
        const { page, metaTitle, metaKeywords, metaDescription, openGraphTags, schemaMarkup, canonicalTag, ogImage, isActive } = req.body;

        const existingSeo = await Seo.findOne({ page });
        if (existingSeo) {
            return res.status(400).json({
                success: false,
                message: 'SEO for this page already exists'
            });
        }

        const newSeo = new Seo({
            page,
            metaTitle,
            metaKeywords,
            metaDescription,
            openGraphTags,
            schemaMarkup,
            canonicalTag,
            ogImage: req.file ? `/uploads/seo/${req.file.filename}` : ogImage,
            isActive
        });

        await newSeo.save();

        res.status(201).json({
            success: true,
            message: 'SEO entry created successfully',
            data: newSeo
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error creating SEO entry',
            error: error.message
        });
    }
};

// Get all SEO entries
exports.getAllSeo = async (req, res) => {
    try {
        const seoList = await Seo.find().sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            data: seoList
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching SEO entries',
            error: error.message
        });
    }
};

// Get SEO by Page Name (for frontend)
exports.getSeoByPage = async (req, res) => {
    try {
        const { pageName } = req.params;
        // Decode the pageName to handle slashes correctly if passed encoded,
        // though usually frontend sends it as query param or part of url.
        // Assuming pageName is passed essentially as "about" or "services" etc.
        // If exact path matching is needed, we might need to handle '/' explicitly.

        // A better approach for frontend might be passing the path as a query parameter or body,
        // but RESTful usually prefers params.
        // However, since paths contain '/', let's assume the frontend sends the path encoded or we use query param.
        // Let's change this to use query param 'page' for flexibility.

        const page = req.query.page;

        if (!page) {
            return res.status(400).json({
                success: false,
                message: 'Page parameter is required'
            });
        }

        const seoData = await Seo.findOne({ page, isActive: true });

        if (!seoData) {
            return res.status(200).json({
                success: true,
                message: 'SEO data not found for this page (handled gracefully)',
                data: null
            });
        }

        res.status(200).json({
            success: true,
            data: seoData
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching SEO data',
            error: error.message
        });
    }
};

// Update SEO entry
exports.updateSeo = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = { ...req.body };

        if (req.file) {
            updateData.ogImage = `/uploads/seo/${req.file.filename}`;
        }

        const updatedSeo = await Seo.findByIdAndUpdate(id, updateData, { new: true });

        if (!updatedSeo) {
            return res.status(404).json({
                success: false,
                message: 'SEO entry not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'SEO entry updated successfully',
            data: updatedSeo
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating SEO entry',
            error: error.message
        });
    }
};

// Delete SEO entry
exports.deleteSeo = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedSeo = await Seo.findByIdAndDelete(id);

        if (!deletedSeo) {
            return res.status(404).json({
                success: false,
                message: 'SEO entry not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'SEO entry deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting SEO entry',
            error: error.message
        });
    }
};
