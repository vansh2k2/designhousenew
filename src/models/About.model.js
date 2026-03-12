const mongoose = require('mongoose');

// About Section Schema (for headings, descriptions, etc.)
const aboutSectionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['heading', 'subheading', 'description', 'highlight'],
    required: true
  },
  content: {
    type: String,
    required: false
  },
  heading: {
    type: String,
    default: ''
  },
  subheading: {
    type: String,
    default: ''
  },
  highlightedWord: {
    type: String,
    default: ''
  },
  title: String, // For highlight type
  order: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

// Description Box Schema (Mission, Vision, etc.)
const descriptionBoxSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['normal', 'mission', 'vision', 'custom'],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  order: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

// Media Schema (Images and Videos)
const mediaSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['image', 'video'],
    required: true
  },
  url: {
    type: String,
    required: true
  },
  title: String,
  caption: String,
  originalUrl: String, // For videos (YouTube/Vimeo original URL)
  platform: String, // youtube, vimeo
  fileName: String,
  fileSize: Number,
  mimeType: String,
  order: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

// Main About Page Schema
const aboutPageSchema = new mongoose.Schema({
  // Static Fields
  heading: {
    type: String,
    default: ''
  },
  subheading: {
    type: String,
    default: ''
  },
  highlightTitle: {
    type: String,
    default: ''
  },
  highlightContent: {
    type: String,
    default: ''
  },
  description: {
    type: String,
    default: ''
  },
  ctaText: {
    type: String,
    default: 'Read More'
  },
  ctaPath: {
    type: String,
    default: '#'
  },
  sections: [aboutSectionSchema],
  descriptionBoxes: [descriptionBoxSchema],
  media: {
    images: [mediaSchema],
    videos: [mediaSchema]
  },
  bottomMediaType: {
    type: String,
    enum: ['image', 'video'],
    default: 'image'
  },
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

// Create indexes for better performance
aboutPageSchema.index({ isPublished: 1 });
aboutPageSchema.index({ 'sections.type': 1 });
aboutPageSchema.index({ 'descriptionBoxes.type': 1 });

const AboutPage = mongoose.model('AboutPage', aboutPageSchema);

module.exports = AboutPage;