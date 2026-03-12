const mongoose = require('mongoose');

const counterCardSchema = new mongoose.Schema({
    number: {
        type: Number,
        required: true
    },
    suffix: {
        type: String,
        default: '+'
    },
    label: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    icon: {
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
    overlayColor: {
        type: String,
        default: '#134698'
    },
    overlayOpacity: {
        type: String,
        default: '50',
        enum: ['30', '40', '50', '60', '70', '80']
    },
    order: {
        type: Number,
        default: 0
    }
}, { _id: true });

const statsCounterSchema = new mongoose.Schema({
    counters: [counterCardSchema],
    isPublished: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

module.exports = mongoose.model('StatsCounter', statsCounterSchema);
