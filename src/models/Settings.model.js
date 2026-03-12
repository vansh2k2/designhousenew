const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
    logo: {
        type: String,
        default: ''
    },
    emails: [{
        email: String,
        forTopbar: {
            type: Boolean,
            default: false
        },
        forContact: {
            type: Boolean,
            default: false
        }
    }],
    phones: [{
        phone: String,
        forTopbar: {
            type: Boolean,
            default: false
        },
        forContact: {
            type: Boolean,
            default: false
        }
    }],
    addresses: [{
        title: String,
        street: String,
        city: String,
        state: String,
        zipCode: String,
        country: String
    }],
    quickLinks: [{
        label: String,
        href: String
    }],
    headerScripts: {
        type: String,
        default: ''
    },
    footerScripts: {
        type: String,
        default: ''
    },
    mapIframe: {
        type: String,
        default: ''
    },
    seoFiles: [{
        filename: String,
        originalName: String,
        path: String,
        fileType: String, // xml, html, txt
        uploadedAt: {
            type: Date,
            default: Date.now
        }
    }]
}, { timestamps: true });

// Check if model already exists to prevent overwrite error in some environments
module.exports = mongoose.models.Settings || mongoose.model('Settings', settingsSchema);
