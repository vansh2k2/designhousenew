const mongoose = require('mongoose');

const sidebarThemeSchema = new mongoose.Schema({
    bgColor: {
        type: String,
        default: '#ffffff'
    },
    iconColor: {
        type: String,
        default: '#2563EB'
    },
    textColor: {
        type: String,
        default: '#0F2854'
    },
    hoverColor: {
        type: String,
        default: '#EFF6FF'
    },
    activeColor: {
        type: String,
        default: '#DBEAFE'
    },
    toggleColor: {
        type: String,
        default: '#2563EB'
    },
    hamburgerColor: {
        type: String,
        default: '#000000'
    },
    isCustomized: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

module.exports = mongoose.model('SidebarTheme', sidebarThemeSchema);
