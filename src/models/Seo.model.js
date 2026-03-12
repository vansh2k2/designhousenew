const mongoose = require('mongoose');

const seoSchema = new mongoose.Schema({
    page: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
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
        type: String, // Can store HTML/String for OG tags
        trim: true
    },
    schemaMarkup: {
        type: String, // Can store JSON-LD string
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
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Seo', seoSchema);
