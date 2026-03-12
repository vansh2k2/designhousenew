const HowWeWork = require('../models/HowWeWork.model');
const fs = require('fs').promises;
const path = require('path');

// ==================== GET HOW WE WORK DATA ====================
exports.getHowWeWork = async (req, res) => {
    try {
        let data = await HowWeWork.findOne({ isPublished: true })
            .sort({ publishedAt: -1 })
            .lean();

        if (!data) {
            data = await HowWeWork.findOne()
                .sort({ createdAt: -1 })
                .lean();
        }

        if (!data) {
            return res.json({
                success: true,
                data: {
                    heading: '',
                    subheading: 'HOW WE WORK',
                    highlightTexts: [],
                    descriptionHtml: '',
                    quote: '',
                    processSteps: [],
                    isPublished: false
                }
            });
        }

        res.json({
            success: true,
            data
        });
    } catch (error) {
        console.error('Error fetching How We Work data:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch data',
            error: error.message
        });
    }
};

// ==================== GET FOR ADMIN ====================
exports.getHowWeWorkForAdmin = async (req, res) => {
    try {
        const data = await HowWeWork.findOne()
            .sort({ createdAt: -1 })
            .lean();

        if (!data) {
            return res.json({
                success: true,
                data: {
                    heading: '',
                    subheading: 'HOW WE WORK',
                    highlightTexts: [],
                    descriptionHtml: '',
                    quote: '',
                    processSteps: [],
                    isPublished: false
                }
            });
        }

        res.json({
            success: true,
            data
        });
    } catch (error) {
        console.error('Error fetching data for admin:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch data',
            error: error.message
        });
    }
};

// ==================== CREATE/UPDATE ====================
exports.createOrUpdateHowWeWork = async (req, res) => {
    try {
        const {
            heading,
            subheading,
            highlightTexts,
            descriptionHtml,
            quote,
            processSteps,
            isPublished
        } = req.body;

        let data = await HowWeWork.findOne().sort({ createdAt: -1 });

        if (data) {
            if (heading !== undefined) data.heading = heading;
            if (subheading !== undefined) data.subheading = subheading;
            if (highlightTexts !== undefined) data.highlightTexts = highlightTexts;
            if (descriptionHtml !== undefined) data.descriptionHtml = descriptionHtml;
            if (quote !== undefined) data.quote = quote;
            if (processSteps !== undefined) data.processSteps = processSteps;

            if (typeof isPublished === 'boolean') {
                data.isPublished = isPublished;
                if (isPublished) {
                    data.publishedAt = new Date();
                }
            }
            data.lastModifiedBy = req.user?._id || req.admin?._id;

            await data.save();
        } else {
            data = await HowWeWork.create({
                heading: heading || '',
                subheading: subheading || 'HOW WE WORK',
                highlightTexts: highlightTexts || [],
                descriptionHtml: descriptionHtml || '',
                quote: quote || '',
                processSteps: processSteps || [],
                isPublished: isPublished || false,
                publishedAt: isPublished ? new Date() : null,
                lastModifiedBy: req.user?._id || req.admin?._id
            });
        }

        res.json({
            success: true,
            message: 'How We Work data saved successfully',
            data
        });
    } catch (error) {
        console.error('Error saving How We Work data:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to save data',
            error: error.message
        });
    }
};

// ==================== UPLOAD IMAGE ====================
exports.uploadImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No image file provided'
            });
        }

        res.json({
            success: true,
            message: 'Image uploaded successfully',
            data: {
                url: `/uploads/how-we-work/${req.file.filename}`,
                fileName: req.file.filename,
                fileSize: req.file.size
            }
        });
    } catch (error) {
        console.error('Error uploading image:', error);
        if (req.file) {
            try {
                await fs.unlink(req.file.path);
            } catch (unlinkError) {
                console.error('Error deleting file:', unlinkError);
            }
        }
        res.status(500).json({
            success: false,
            message: 'Failed to upload image',
            error: error.message
        });
    }
};
