const Settings = require('../models/Settings.model');
const fs = require('fs');
const path = require('path');

// Get settings
exports.getSettings = async (req, res) => {
    try {
        let settings = await Settings.findOne();

        if (!settings) {
            // Create default settings if not exists
            settings = await Settings.create({
                emails: [],
                phones: [],
                addresses: []
            });
        }

        res.status(200).json({
            success: true,
            data: settings
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching settings',
            error: error.message
        });
    }
};

// Update settings
exports.updateSettings = async (req, res) => {
    try {
        let settings = await Settings.findOne();

        if (!settings) {
            settings = new Settings();
        }

        // Handle Logo Upload
        if (req.file) {
            // Delete old logo if exists
            if (settings.logo) {
                const oldLogoPath = path.join(__dirname, '../../', settings.logo);
                if (fs.existsSync(oldLogoPath)) {
                    fs.unlinkSync(oldLogoPath);
                }
            }
            settings.logo = `/uploads/settings/${req.file.filename}`;
        }

        // Handle Data Updates
        if (req.body.emails) {
            settings.emails = JSON.parse(req.body.emails);
        }
        if (req.body.phones) {
            settings.phones = JSON.parse(req.body.phones);
        }
        if (req.body.addresses) {
            settings.addresses = JSON.parse(req.body.addresses);
        }
        if (req.body.quickLinks) {
            settings.quickLinks = JSON.parse(req.body.quickLinks);
        }
        if (req.body.mapIframe !== undefined) {
            settings.mapIframe = req.body.mapIframe;
        }

        await settings.save();

        res.status(200).json({
            success: true,
            message: 'Settings updated successfully',
            data: settings
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating settings',
            error: error.message
        });
    }
};
