const WhyChooseUs = require('../models/whyChooseUs.model');
const path = require('path');
const fs = require('fs');

exports.getWhyChooseUs = async (req, res) => {
    try {
        const data = await WhyChooseUs.findOne();
        res.status(200).json({
            success: true,
            data
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching Why Choose Us data',
            error: error.message
        });
    }
};

exports.updateWhyChooseUs = async (req, res) => {
    try {
        const updateData = { ...req.body };

        // Handle file upload if present
        if (req.file) {
            updateData.image = `/uploads/${req.file.filename}`;
        }

        // Parse array fields if they come as strings (common with multipart/form-data)
        if (typeof updateData.excellenceCards === 'string') {
            updateData.excellenceCards = JSON.parse(updateData.excellenceCards);
        }
        if (typeof updateData.featureCards === 'string') {
            updateData.featureCards = JSON.parse(updateData.featureCards);
        }
        if (typeof updateData.statCounters === 'string') {
            updateData.statCounters = JSON.parse(updateData.statCounters);
        }

        let data = await WhyChooseUs.findOne();

        if (data) {
            // Delete old image if a new one is uploaded
            if (req.file && data.image && data.image.startsWith('/uploads/')) {
                const oldImagePath = path.join(__dirname, '..', '..', data.image);
                if (fs.existsSync(oldImagePath)) {
                    fs.unlinkSync(oldImagePath);
                }
            }
            data = await WhyChooseUs.findByIdAndUpdate(data._id, updateData, { new: true });
        } else {
            data = new WhyChooseUs(updateData);
            await data.save();
        }

        res.status(200).json({
            success: true,
            message: 'Why Choose Us section updated successfully',
            data
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating Why Choose Us section',
            error: error.message
        });
    }
};
