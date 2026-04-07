const HeroImage = require('../models/heroImage.model');
const { logActivity } = require('./activityLog.controller');
const path = require('path');
const fs = require('fs');

exports.getAllHeroImages = async (req, res) => {
    try {
        const data = await HeroImage.find().sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            data
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching Hero Background Images',
            error: error.message
        });
    }
};

exports.getHeroImageById = async (req, res) => {
    try {
        const data = await HeroImage.findById(req.params.id);
        if (!data) {
            return res.status(404).json({
                success: false,
                message: 'Hero Background Image not found'
            });
        }
        res.status(200).json({
            success: true,
            data
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching Hero Background Image',
            error: error.message
        });
    }
};

exports.getHeroImageByPage = async (req, res) => {
    try {
        const data = await HeroImage.findOne({ pageName: req.params.pageName, status: 'Active' });
        res.status(200).json({
            success: true,
            data
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching Hero Background Image for page',
            error: error.message
        });
    }
};

exports.createHeroImage = async (req, res) => {
    try {
        const inputData = { ...req.body };

        if (req.file) {
            inputData.backgroundImage = `/uploads/${req.file.filename}`;
        }

        // Check if hero image for this page already exists
        const existing = await HeroImage.findOne({ pageName: inputData.pageName });
        if (existing) {
            // If file uploaded, delete it as we are not creating
            if (req.file) {
                const filePath = path.join(__dirname, '..', '..', 'uploads', req.file.filename);
                if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
            }
            return res.status(400).json({
                success: false,
                message: `Hero Image for page "${inputData.pageName}" already exists. Use update instead.`
            });
        }

        const data = new HeroImage(inputData);
        await data.save();

        await logActivity(req.body.updatedBy || "Admin User", "Created", "Hero Image", `Created hero image for page: ${inputData.pageName}`);

        res.status(201).json({
            success: true,
            message: 'Hero Background Image created successfully',
            data
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error creating Hero Background Image',
            error: error.message
        });
    }
};

exports.updateHeroImage = async (req, res) => {
    try {
        const updateData = { ...req.body };
        const heroImage = await HeroImage.findById(req.params.id);

        if (!heroImage) {
            return res.status(404).json({
                success: false,
                message: 'Hero Background Image not found'
            });
        }

        if (req.file) {
            // Delete old image
            if (heroImage.backgroundImage && heroImage.backgroundImage.startsWith('/uploads/')) {
                const oldImagePath = path.join(__dirname, '..', '..', heroImage.backgroundImage);
                if (fs.existsSync(oldImagePath)) {
                    fs.unlinkSync(oldImagePath);
                }
            }
            updateData.backgroundImage = `/uploads/${req.file.filename}`;
        }

        const data = await HeroImage.findByIdAndUpdate(req.params.id, updateData, { new: true });

        await logActivity(req.body.updatedBy || "Admin User", "Updated", "Hero Image", `Updated hero image for page: ${data.pageName}`);

        res.status(200).json({
            success: true,
            message: 'Hero Background Image updated successfully',
            data
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating Hero Background Image',
            error: error.message
        });
    }
};

exports.deleteHeroImage = async (req, res) => {
    try {
        const heroImage = await HeroImage.findById(req.params.id);

        if (!heroImage) {
            return res.status(404).json({
                success: false,
                message: 'Hero Background Image not found'
            });
        }

        // Delete associated image file
        if (heroImage.backgroundImage && heroImage.backgroundImage.startsWith('/uploads/')) {
            const imagePath = path.join(__dirname, '..', '..', heroImage.backgroundImage);
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        }

        const updatedBy = req.query.updatedBy || req.body.updatedBy || "Admin User";
        await HeroImage.findByIdAndDelete(req.params.id);

        await logActivity(updatedBy, "Deleted", "Hero Image", `Deleted hero image for page: ${heroImage.pageName}`);

        res.status(200).json({
            success: true,
            message: 'Hero Background Image deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting Hero Background Image',
            error: error.message
        });
    }
};
