const mongoose = require('mongoose');

const vacancySchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Job title is required'],
    trim: true
  },
  experience: {
    type: String,
    required: [true, 'Experience is required'],
    trim: true
  },
  salary: {
    type: String,
    default: 'Not disclosed',
    trim: true
  },
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  requirements: {
    type: [String],
    default: []
  },
  vacancyCount: {
    type: Number,
    default: 1
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },
  order: {
    type: Number,
    default: 0
  },
  updatedBy: {
    type: String,
    default: "Admin User",
    trim: true
  }
}, {
  timestamps: true
});

// Index for faster queries
vacancySchema.index({ createdAt: -1 });
vacancySchema.index({ status: 1 });
vacancySchema.index({ order: 1 });

module.exports = mongoose.model('Vacancy', vacancySchema);