const Settings = require('../models/Settings.model');
const path = require('path');
const fs = require('fs');

// Get advanced SEO settings
exports.getAdvancedSeo = async (req, res) => {
    try {
        let settings = await Settings.findOne();
        if (!settings) {
            settings = await Settings.create({});
        }
        res.status(200).json({
            success: true,
            data: {
                headerScripts: settings.headerScripts || '',
                footerScripts: settings.footerScripts || '',
                seoFiles: settings.seoFiles || []
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Update global scripts
exports.updateScripts = async (req, res) => {
    try {
        const { headerScripts, footerScripts } = req.body;
        let settings = await Settings.findOne();

        if (!settings) {
            settings = new Settings({ headerScripts, footerScripts });
        } else {
            settings.headerScripts = headerScripts;
            settings.footerScripts = footerScripts;
        }

        await settings.save();
        res.status(200).json({ success: true, message: "Scripts updated successfully", data: settings });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Upload SEO File
exports.uploadSeoFile = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: "No file uploaded" });
        }

        const { filename, originalname, path: filePath } = req.file;
        const fileType = originalname.split('.').pop().toLowerCase();

        if (!['xml', 'html', 'txt'].includes(fileType)) {
            // Remove the file if invalid type
            fs.unlinkSync(filePath);
            return res.status(400).json({ success: false, message: "Only .xml, .html, and .txt files are allowed" });
        }

        let settings = await Settings.findOne();
        if (!settings) settings = new Settings();

        // Check if file with same original name exists, if so replace or update record
        const existingIndex = settings.seoFiles.findIndex(f => f.originalName === originalname);

        const fileData = {
            filename,
            originalName: originalname,
            path: `/uploads/seo/${filename}`,
            fileType,
            uploadedAt: new Date()
        };

        if (existingIndex !== -1) {
            // Remove old physical file
            const oldPath = path.join(__dirname, '../../', settings.seoFiles[existingIndex].path);
            if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
            settings.seoFiles[existingIndex] = fileData;
        } else {
            settings.seoFiles.push(fileData);
        }

        await settings.save();
        res.status(200).json({ success: true, message: "File uploaded successfully", data: settings.seoFiles });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Delete SEO File
exports.deleteSeoFile = async (req, res) => {
    try {
        const { fileId } = req.params;
        const settings = await Settings.findOne();

        if (!settings) return res.status(404).json({ success: false, message: "Settings not found" });

        const fileIndex = settings.seoFiles.findIndex(f => f._id.toString() === fileId);
        if (fileIndex === -1) return res.status(404).json({ success: false, message: "File record not found" });

        const fileData = settings.seoFiles[fileIndex];
        const filePath = path.join(__dirname, '../../', 'uploads/seo', fileData.filename);

        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        settings.seoFiles.splice(fileIndex, 1);
        await settings.save();

        res.status(200).json({ success: true, message: "File deleted successfully", data: settings.seoFiles });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
