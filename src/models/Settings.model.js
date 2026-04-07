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
    otpSettings: {
        opusApiKey: { type: String, default: '001d27c3a67d42099d71c079cd1bce76' },
        opusApiUrl: { type: String, default: 'http://api.opustechnology.in/wapp/v2/api/send' },
        fromEmail: { type: String, default: 'noreply@designhouse.org' },
        fromName: { type: String, default: 'Design House' },
        smtpUser: { type: String, default: 'manishsirohi023@gmail.com' },
        smtpPass: { type: String, default: '' },
        smtpHost: { type: String, default: 'smtp.gmail.com' },
        smtpPort: { type: String, default: '465' }
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
