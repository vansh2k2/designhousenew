const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    videoId: {
        type: String,
        required: true
    },
    order: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

const videoPortfolioSchema = new mongoose.Schema({
    heading: {
        type: String,
        default: 'Video Portfolio'
    },
    highlightedWord: {
        type: String,
        default: 'Portfolio'
    },
    shortDescription: {
        type: String,
        default: 'Watch our exhibitions, interiors & retail projects in action'
    },
    bgImage: {
        type: String,
        default: 'https://images.unsplash.com/photo-1615873968403-89e068629265?auto=format&fit=crop&w=1920&q=80'
    },
    altText: {
        type: String,
        default: 'Video Portfolio Background'
    },
    videos: [videoSchema],
    isPublished: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

module.exports = mongoose.model('VideoPortfolio', videoPortfolioSchema);
