const mongoose = require('mongoose');

const whatWeDoCardSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    icon: {
        type: String,
        default: 'Package'
    },
    image: {
        type: String,
        required: true
    },
    altText: {
        type: String,
        default: ''
    },
    descriptionHtml: {
        type: String,
        default: ''
    },
    features: [{
        type: String
    }],
    buttonText: {
        type: String,
        default: 'Learn More'
    },
    buttonUrl: {
        type: String,
        default: '#'
    },
    order: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

const whatWeDoSchema = new mongoose.Schema({
    subheading: {
        type: String,
        default: 'WHAT WE DO'
    },
    heading: {
        type: String,
        default: 'Our Expertise'
    },
    highlightText: {
        type: String,
        default: ''
    },
    description: {
        type: String,
        default: ''
    },
    cards: [whatWeDoCardSchema],
    isPublished: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

module.exports = mongoose.model('WhatWeDo', whatWeDoSchema);
