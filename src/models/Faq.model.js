const mongoose = require('mongoose');

const faqItemSchema = new mongoose.Schema({
    question: {
        type: String,
        required: true
    },
    answer: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    altText: {
        type: String,
        default: ''
    },
    order: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

const faqSchema = new mongoose.Schema({
    subheading: {
        type: String,
        default: 'FAQS'
    },
    heading: {
        type: String,
        default: 'Frequently Asked Questions'
    },
    highlightedWord: {
        type: String,
        default: 'Questions'
    },
    faqs: [faqItemSchema],
    isPublished: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Faq', faqSchema);
