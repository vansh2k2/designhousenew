const mongoose = require('mongoose');

const heroImageSchema = new mongoose.Schema({
    pageName: {
        type: String,
        required: true,
        unique: true
    },
    backgroundImage: {
        type: String,
        required: true
    },
    imageAltText: {
        type: String,
        default: ''
    },
    title: {
        type: String,
        default: ''
    },
    highlightedText: {
        type: String,
        default: ''
    },
    shortDescription: {
        type: String,
        default: ''
    },
    status: {
        type: String,
        enum: ['Active', 'Inactive'],
        default: 'Active'
    },
    isPublished: {
        type: Boolean,
        default: true
    },
    updatedBy: {
        type: String,
        default: "Admin User",
        trim: true
    }
}, { timestamps: true });

module.exports = mongoose.model('HeroImage', heroImageSchema);
