const FeaturedServices = require('../models/Service.model');
const fs = require('fs').promises;
const path = require('path');

// ==================== GET ALL SERVICES DATA ====================
exports.getFeaturedServices = async (req, res) => {
    try {
        let servicesData = await FeaturedServices.findOne().sort({ createdAt: -1 });

        if (!servicesData) {
            servicesData = await FeaturedServices.create({
                subheading: 'SERVICES WE DO',
                heading: 'Our Featured Services',
                highlightedWord: '& Transformations',
                services: []
            });
        }

        res.status(200).json({
            success: true,
            data: servicesData
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch services data',
            error: error.message
        });
    }
};

// ==================== UPDATE HEADINGS ====================
exports.updateHeadings = async (req, res) => {
    try {
        const { subheading, heading, highlightedWord } = req.body;

        let servicesData = await FeaturedServices.findOne().sort({ createdAt: -1 });

        if (!servicesData) {
            servicesData = new FeaturedServices();
        }

        servicesData.subheading = subheading || servicesData.subheading;
        servicesData.heading = heading || servicesData.heading;
        servicesData.highlightedWord = highlightedWord || servicesData.highlightedWord;

        await servicesData.save();

        res.status(200).json({
            success: true,
            message: 'Headings updated successfully',
            data: servicesData
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to update headings',
            error: error.message
        });
    }
};

// ==================== ADD SERVICE CARD ====================
exports.addServiceCard = async (req, res) => {
    try {
        const { title, description, image, altText, icon, buttonText, buttonUrl, number } = req.body;

        let servicesData = await FeaturedServices.findOne().sort({ createdAt: -1 });

        if (!servicesData) {
            servicesData = await FeaturedServices.create({ services: [] });
        }

        const newCard = {
            title,
            description,
            image,
            altText,
            icon,
            buttonText,
            buttonUrl,
            number: number || `0${servicesData.services.length + 1}`.slice(-2)
        };

        servicesData.services.push(newCard);
        await servicesData.save();

        res.status(201).json({
            success: true,
            message: 'Service card added successfully',
            data: servicesData.services[servicesData.services.length - 1]
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
exports.updateServiceCard = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        const servicesData = await FeaturedServices.findOne().sort({ createdAt: -1 });

        if (!servicesData) {
            return res.status(404).json({ success: false, message: 'Services data not found' });
        }

        const cardIndex = servicesData.services.findIndex(card => card._id.toString() === id);

        if (cardIndex === -1) {
            return res.status(404).json({ success: false, message: 'Service card not found' });
        }

        // Update fields
        Object.keys(updateData).forEach(key => {
            if (key !== '_id') {
                servicesData.services[cardIndex][key] = updateData[key];
            }
        });

        await servicesData.save();

        res.status(200).json({
            success: true,
            message: 'Service card updated successfully',
            data: servicesData.services[cardIndex]
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
exports.deleteServiceCard = async (req, res) => {
    try {
        const { id } = req.params;

        const servicesData = await FeaturedServices.findOne().sort({ createdAt: -1 });

        if (!servicesData) {
            return res.status(404).json({ success: false, message: 'Services data not found' });
        }

        const card = servicesData.services.id(id);
        if (!card) {
            return res.status(404).json({ success: false, message: 'Service card not found' });
        }

        // Optionally delete image from filesystem if it exists and is local
        if (card.image && card.image.startsWith('/uploads/services/')) {
            try {
                const filePath = path.join(process.cwd(), card.image);
                await fs.unlink(filePath);
            } catch (err) {
                console.error('Error deleting image file:', err);
            }
        }

        servicesData.services.pull(id);
        await servicesData.save();

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
