const VideoPortfolio = require('../models/VideoPortfolio.model');
const { logActivity } = require('./activityLog.controller');

// ==================== GET VIDEO PORTFOLIO DATA ====================
exports.getVideoPortfolio = async (req, res) => {
    try {
        let portfolioData = await VideoPortfolio.findOne().sort({ createdAt: -1 });

        if (!portfolioData) {
            portfolioData = await VideoPortfolio.create({
                heading: 'Video Portfolio',
                highlightedWord: 'Portfolio',
                shortDescription: 'Watch our exhibitions, interiors & retail projects in action',
                videos: []
            });
        }

        res.status(200).json({
            success: true,
            data: portfolioData
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch video portfolio data',
            error: error.message
        });
    }
};

// ==================== UPDATE HEADINGS & HERO ====================
exports.updateHeroSection = async (req, res) => {
    try {
        const { heading, highlightedWord, shortDescription, bgImage, altText } = req.body;

        let portfolioData = await VideoPortfolio.findOne().sort({ createdAt: -1 });

        if (!portfolioData) {
            portfolioData = new VideoPortfolio();
        }

        portfolioData.heading = heading || portfolioData.heading;
        portfolioData.highlightedWord = highlightedWord || portfolioData.highlightedWord;
        portfolioData.shortDescription = shortDescription !== undefined ? shortDescription : portfolioData.shortDescription;
        portfolioData.bgImage = bgImage || portfolioData.bgImage;
        portfolioData.altText = altText !== undefined ? altText : portfolioData.altText;

        await portfolioData.save();

        await logActivity(req.body.updatedBy || "Admin User", "Updated", "Video Portfolio", `Updated Video Portfolio hero section`);

        res.status(200).json({
            success: true,
            message: 'Hero section updated successfully',
            data: portfolioData
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to update hero section',
            error: error.message
        });
    }
};

// ==================== ADD VIDEO ====================
exports.addVideo = async (req, res) => {
    try {
        const { title, videoId } = req.body;

        let portfolioData = await VideoPortfolio.findOne().sort({ createdAt: -1 });

        if (!portfolioData) {
            portfolioData = await VideoPortfolio.create({ videos: [] });
        }

        const newVideo = {
            title,
            videoId,
            order: portfolioData.videos.length
        };

        portfolioData.videos.push(newVideo);
        await portfolioData.save();

        await logActivity(req.body.updatedBy || "Admin User", "Created", "Video Portfolio", `Added video: ${title}`);

        res.status(201).json({
            success: true,
            message: 'Video added successfully',
            data: portfolioData.videos[portfolioData.videos.length - 1]
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to add video',
            error: error.message
        });
    }
};

// ==================== UPDATE VIDEO ====================
exports.updateVideo = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        const portfolioData = await VideoPortfolio.findOne().sort({ createdAt: -1 });

        if (!portfolioData) {
            return res.status(404).json({ success: false, message: 'Video portfolio data not found' });
        }

        const videoIndex = portfolioData.videos.findIndex(v => v._id.toString() === id);

        if (videoIndex === -1) {
            return res.status(404).json({ success: false, message: 'Video not found' });
        }

        // Update fields
        Object.keys(updateData).forEach(key => {
            if (key !== '_id') {
                portfolioData.videos[videoIndex][key] = updateData[key];
            }
        });

        await portfolioData.save();

        await logActivity(req.body.updatedBy || "Admin User", "Updated", "Video Portfolio", `Updated video: ${portfolioData.videos[videoIndex].title}`);

        res.status(200).json({
            success: true,
            message: 'Video updated successfully',
            data: portfolioData.videos[videoIndex]
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to update video',
            error: error.message
        });
    }
};

// ==================== DELETE VIDEO ====================
exports.deleteVideo = async (req, res) => {
    try {
        const { id } = req.params;

        const portfolioData = await VideoPortfolio.findOne().sort({ createdAt: -1 });

        if (!portfolioData) {
            return res.status(404).json({ success: false, message: 'Video portfolio data not found' });
        }

        const video = portfolioData.videos.id(id);
        if (!video) {
            return res.status(404).json({ success: false, message: 'Video not found' });
        }

        const updatedBy = req.query.updatedBy || req.body.updatedBy || "Admin User";
        portfolioData.videos.pull(id);
        await portfolioData.save();

        await logActivity(updatedBy, "Deleted", "Video Portfolio", `Deleted video: ${video.title}`);

        res.status(200).json({
            success: true,
            message: 'Video deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to delete video',
            error: error.message
        });
    }
};
