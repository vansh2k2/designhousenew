const StatsCounter = require('../models/StatsCounter.model');
const path = require('path');
const fs = require('fs').promises;

// Get all stats counter data
exports.getStatsCounter = async (req, res, next) => {
    try {
        let statsData = await StatsCounter.findOne();

        if (!statsData) {
            statsData = await StatsCounter.create({
                counters: [],
                isPublished: true
            });
        }

        res.status(200).json({
            success: true,
            data: statsData
        });
    } catch (error) {
        next(error);
    }
};

// Add new counter card
exports.addCounterCard = async (req, res, next) => {
    try {
        const { number, suffix, label, description, icon, image, altText, overlayColor, overlayOpacity, order } = req.body;

        let statsData = await StatsCounter.findOne();
        if (!statsData) {
            statsData = await StatsCounter.create({ counters: [] });
        }

        const newCard = {
            number,
            suffix: suffix || '+',
            label,
            description,
            icon,
            image,
            altText: altText || '',
            overlayColor: overlayColor || '#134698',
            overlayOpacity: overlayOpacity || '50',
            order: order || statsData.counters.length
        };

        statsData.counters.push(newCard);
        await statsData.save();

        res.status(201).json({
            success: true,
            data: statsData
        });
    } catch (error) {
        next(error);
    }
};

// Update counter card
exports.updateCounterCard = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { number, suffix, label, description, icon, image, altText, overlayColor, overlayOpacity, order } = req.body;

        const statsData = await StatsCounter.findOne();
        if (!statsData) {
            return res.status(404).json({
                success: false,
                message: 'Stats counter data not found'
            });
        }

        const card = statsData.counters.id(id);
        if (!card) {
            return res.status(404).json({
                success: false,
                message: 'Counter card not found'
            });
        }

        // Update fields
        if (number !== undefined) card.number = number;
        if (suffix !== undefined) card.suffix = suffix;
        if (label !== undefined) card.label = label;
        if (description !== undefined) card.description = description;
        if (icon !== undefined) card.icon = icon;
        if (image !== undefined) card.image = image;
        if (altText !== undefined) card.altText = altText;
        if (overlayColor !== undefined) card.overlayColor = overlayColor;
        if (overlayOpacity !== undefined) card.overlayOpacity = overlayOpacity;
        if (order !== undefined) card.order = order;

        await statsData.save();

        res.status(200).json({
            success: true,
            data: statsData
        });
    } catch (error) {
        next(error);
    }
};

// Delete counter card
exports.deleteCounterCard = async (req, res, next) => {
    try {
        const { id } = req.params;

        const statsData = await StatsCounter.findOne();
        if (!statsData) {
            return res.status(404).json({
                success: false,
                message: 'Stats counter data not found'
            });
        }

        const card = statsData.counters.id(id);
        if (!card) {
            return res.status(404).json({
                success: false,
                message: 'Counter card not found'
            });
        }

        // Delete image file if it's a local upload
        if (card.image && card.image.startsWith('/uploads/stats-counter/')) {
            try {
                const filePath = path.join(process.cwd(), card.image);
                await fs.unlink(filePath);
            } catch (err) {
                console.error('Error deleting image file:', err);
            }
        }

        statsData.counters.pull(id);
        await statsData.save();

        res.status(200).json({
            success: true,
            data: statsData
        });
    } catch (error) {
        next(error);
    }
};
