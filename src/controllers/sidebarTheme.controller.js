const SidebarTheme = require('../models/SidebarTheme.model');

exports.getTheme = async (req, res) => {
    try {
        let theme = await SidebarTheme.findOne();
        if (!theme) {
            theme = await SidebarTheme.create({});
        }
        res.status(200).json({
            success: true,
            data: theme
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

exports.updateTheme = async (req, res) => {
    try {
        let theme = await SidebarTheme.findOne();
        if (!theme) {
            theme = new SidebarTheme({ ...req.body, isCustomized: true });
        } else {
            Object.assign(theme, { ...req.body, isCustomized: true });
        }
        await theme.save();
        res.status(200).json({
            success: true,
            data: theme,
            message: "Sidebar theme updated successfully"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
