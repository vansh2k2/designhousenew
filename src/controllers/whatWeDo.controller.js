const WhatWeDo = require('../models/WhatWeDo.model');
const { logActivity } = require('./activityLog.controller');
const fs = require('fs').promises;
const path = require('path');

// ==================== GET WHAT WE DO DATA ====================
exports.getWhatWeDo = async (req, res) => {
    try {
        let data = await WhatWeDo.findOne().sort({ createdAt: -1 });

        if (!data) {
            data = await WhatWeDo.create({
                subheading: 'WHAT WE DO',
                heading: 'Our Expertise',
                highlightText: 'Expertise',
                description: 'Comprehensive Design Solutions',
                cards: []
            });
        }

        res.status(200).json({
            success: true,
            data
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch What We Do data',
            error: error.message
        });
    }
};

// ==================== UPDATE GLOBAL CONTENT ====================
exports.updateGlobalContent = async (req, res) => {
    try {
        const { subheading, heading, highlightText, description } = req.body;

        let data = await WhatWeDo.findOne().sort({ createdAt: -1 });

        if (!data) {
            data = new WhatWeDo();
        }

        data.subheading = subheading || data.subheading;
        data.heading = heading || data.heading;
        data.highlightText = highlightText || data.highlightText;
        data.description = description || data.description;

        await data.save();

        await logActivity(req.body.updatedBy || "Admin User", "Updated", "What We Do", `Updated What We Do section content`);

        res.status(200).json({
            success: true,
            message: 'Section content updated successfully',
            data
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to update section content',
            error: error.message
        });
    }
};

// ==================== ADD SERVICE CARD ====================
exports.addCard = async (req, res) => {
    try {
        const { title, icon, altText, descriptionHtml, features, buttonText, buttonUrl } = req.body;

        // Features should be parsed if coming as string
        let parsedFeatures = features;
        if (typeof features === 'string') {
            try {
                parsedFeatures = JSON.parse(features);
            } catch (e) {
                parsedFeatures = features.split(',').map(f => f.trim());
            }
        }

        let data = await WhatWeDo.findOne().sort({ createdAt: -1 });

        if (!data) {
            data = await WhatWeDo.create({ cards: [] });
        }

        const newCard = {
            title,
            icon: icon || 'Package',
            altText: altText || '',
            descriptionHtml: descriptionHtml || '',
            features: Array.isArray(parsedFeatures) ? parsedFeatures : [],
            buttonText: buttonText || 'Learn More',
            buttonUrl: buttonUrl || '#',
            image: req.file ? `/uploads/whatwedo/${req.file.filename}` : ''
        };

        data.cards.push(newCard);
        await data.save();

        await logActivity(req.body.updatedBy || "Admin User", "Created", "What We Do", `Added service card: ${title}`);

        res.status(201).json({
            success: true,
            message: 'Service card added successfully',
            data: data.cards[data.cards.length - 1]
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to add service card',
            error: error.message
        });
    }
};

// ==================== UPDATE SERVICE CARD ====================
exports.updateCard = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = { ...req.body };

        if (typeof updateData.features === 'string') {
            try {
                updateData.features = JSON.parse(updateData.features);
            } catch (e) {
                updateData.features = updateData.features.split(',').map(f => f.trim());
            }
        }

        const data = await WhatWeDo.findOne().sort({ createdAt: -1 });

        if (!data) {
            return res.status(404).json({ success: false, message: 'Data not found' });
        }

        const cardIndex = data.cards.findIndex(card => card._id.toString() === id);

        if (cardIndex === -1) {
            return res.status(404).json({ success: false, message: 'Card not found' });
        }

        // Handle image update
        if (req.file) {
            // Delete old image if it exists
            const oldImage = data.cards[cardIndex].image;
            if (oldImage && oldImage.startsWith('/uploads/whatwedo/')) {
                try {
                    const oldPath = path.join(process.cwd(), oldImage);
                    await fs.unlink(oldPath);
                } catch (err) {
                    console.error('Error deleting old image:', err);
                }
            }
            updateData.image = `/uploads/whatwedo/${req.file.filename}`;
        }

        // Update fields
        Object.keys(updateData).forEach(key => {
            if (key !== '_id') {
                data.cards[cardIndex][key] = updateData[key];
            }
        });

        await data.save();

        await logActivity(req.body.updatedBy || "Admin User", "Updated", "What We Do", `Updated service card: ${updateData.title || data.cards[cardIndex].title}`);

        res.status(200).json({
            success: true,
            message: 'Service card updated successfully',
            data: data.cards[cardIndex]
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to update service card',
            error: error.message
        });
    }
};

// ==================== DELETE SERVICE CARD ====================
exports.deleteCard = async (req, res) => {
    try {
        const { id } = req.params;

        const data = await WhatWeDo.findOne().sort({ createdAt: -1 });

        if (!data) {
            return res.status(404).json({ success: false, message: 'Data not found' });
        }

        const card = data.cards.id(id);
        if (!card) {
            return res.status(404).json({ success: false, message: 'Card not found' });
        }

        // Delete image file
        if (card.image && card.image.startsWith('/uploads/whatwedo/')) {
            try {
                const filePath = path.join(process.cwd(), card.image);
                await fs.unlink(filePath);
            } catch (err) {
                console.error('Error deleting image file:', err);
            }
        }

        const updatedBy = req.query.updatedBy || req.body.updatedBy || "Admin User";
        data.cards.pull(id);
        await data.save();

        await logActivity(updatedBy, "Deleted", "What We Do", `Deleted service card: ${card.title}`);

        res.status(200).json({
            success: true,
            message: 'Service card deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to delete service card',
            error: error.message
        });
    }
};
