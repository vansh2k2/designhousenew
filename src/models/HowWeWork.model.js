const mongoose = require('mongoose');

const processStepSchema = new mongoose.Schema({
    number: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    description: {
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
    icon: {
        type: String,
        default: 'Users' // Lucide icon name
    },
    color: {
        type: String,
        enum: ['orange', 'blue'],
        default: 'blue'
    },
    order: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

const howWeWorkSchema = new mongoose.Schema({
    heading: {
        type: String,
        default: ''
    },
    subheading: {
        type: String,
        default: 'HOW WE WORK'
    },
    highlightTexts: {
        type: [String],
        default: []
    },
    descriptionHtml: {
        type: String,
        default: ''
    },
    quote: {
        type: String,
        default: ''
    },
    processSteps: [processStepSchema],
    isPublished: {
        type: Boolean,
        default: false
    },
    publishedAt: Date,
    lastModifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin'
    }
}, { timestamps: true });

const HowWeWork = mongoose.model('HowWeWork', howWeWorkSchema);

module.exports = HowWeWork;
