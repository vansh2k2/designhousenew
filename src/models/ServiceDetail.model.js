const mongoose = require('mongoose');

const serviceDetailSchema = new mongoose.Schema({
    serviceName: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    bgImage: {
        type: String,
        required: true
    },
    bgAltText: {
        type: String,
        default: ''
    },
    bgTitle: {
        type: String,
        required: true
    },
    bgHighlightTitle: {
        type: String,
        default: ''
    },
    title: {
        type: String,
        default: ''
    },
    highlightText: {
        type: String,
        default: ''
    },
    description: {
        type: String,
        required: true
    },
    galleryImages: [
        {
            url: { type: String, default: '' },
            altText: { type: String, default: '' }
        }
    ],
    seo: {
        metaTitle: {
            type: String,
            trim: true,
            maxLength: 65
        },
        metaKeywords: {
            type: String,
            trim: true
        },
        metaDescription: {
            type: String,
            trim: true,
            maxLength: 155
        },
        openGraphTags: {
            type: String,
            trim: true
        },
        schemaMarkup: {
            type: String,
            trim: true
        },
        canonicalTag: {
            type: String,
            trim: true
        },
        ogImage: {
            type: String,
            trim: true
        },
        ogImageAltText: {
            type: String,
            trim: true
        }
    },
    updatedBy: {
        type: String,
        default: "Admin User",
        trim: true
    }
}, { timestamps: true });

module.exports = mongoose.model('ServiceDetail', serviceDetailSchema);
