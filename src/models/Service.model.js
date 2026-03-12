const mongoose = require('mongoose');

const serviceCardSchema = new mongoose.Schema({
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
        default: 'ShoppingBag'
    },
    buttonText: {
        type: String,
        default: 'Learn More'
    },
    buttonUrl: {
        type: String,
        default: '#'
    },
    number: {
        type: String,
        default: '01'
    },
    order: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

const featuredServicesSchema = new mongoose.Schema({
    subheading: {
        type: String,
        default: 'SERVICES WE DO'
    },
    heading: {
        type: String,
        default: 'Our Featured Services'
    },
    highlightedWord: {
        type: String,
        default: '& Transformations'
    },
    services: [serviceCardSchema],
    isPublished: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

module.exports = mongoose.model('FeaturedServices', featuredServicesSchema);
