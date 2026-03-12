const SocialMedia = require("../models/SocialMedia.model");

// @desc    Get Social Media Links (Create if not exists)
// @route   GET /api/social-media
// @access  Public
exports.getSocialMedia = async (req, res) => {
    try {
        let socialMedia = await SocialMedia.findOne();

        if (!socialMedia) {
            socialMedia = await SocialMedia.create({});
        }

        res.status(200).json({
            success: true,
            data: socialMedia,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Server Error",
        });
    }
};

// @desc    Update Social Media Links
// @route   PUT /api/social-media
// @access  Private (Admin)
exports.updateSocialMedia = async (req, res) => {
    try {
        const {
            facebook,
            instagram,
            twitter,
            linkedin,
            youtube,
            whatsappNumber,
            whatsappMessage,
            callNumber,
        } = req.body;

        let socialMedia = await SocialMedia.findOne();

        if (!socialMedia) {
            socialMedia = await SocialMedia.create(req.body);
        } else {
            socialMedia.facebook = facebook || "";
            socialMedia.instagram = instagram || "";
            socialMedia.twitter = twitter || "";
            socialMedia.linkedin = linkedin || "";
            socialMedia.youtube = youtube || "";
            socialMedia.whatsappNumber = whatsappNumber || "";
            socialMedia.whatsappMessage = whatsappMessage || "";
            socialMedia.callNumber = callNumber || "";

            await socialMedia.save();
        }

        res.status(200).json({
            success: true,
            message: "Social Media links updated successfully",
            data: socialMedia,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Server Error",
        });
    }
};
