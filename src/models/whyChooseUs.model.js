const mongoose = require('mongoose');

const whyChooseUsSchema = new mongoose.Schema({
    subheading: {
        type: String,
        default: 'WHY CHOOSE US'
    },
    heading: {
        type: String,
        required: true
    },
    highlightedText: {
        type: String,
        default: ''
    },
    descriptionHtml: {
        type: String,
        default: ''
    },
    excellenceCards: [{
        text: { type: String, required: true }
    }],
    featureCards: [{
        title: { type: String, required: true },
        description: { type: String, required: true }
    }],
    statCounters: [{
        number: { type: String, required: true },
        title: { type: String, required: true }
    }],
    image: {
        type: String,
        default: ''
    },
    imageAltText: {
        type: String,
        default: ''
    },
    isPublished: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

module.exports = mongoose.model('WhyChooseUs', whyChooseUsSchema);
