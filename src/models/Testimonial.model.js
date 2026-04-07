const mongoose = require('mongoose');

const testimonialSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  role: {
    type: String,
    required: true,
    trim: true
  },
  company: {
    type: String,
    trim: true,
    default: ''
  },
  feedback: {
    type: String,
    required: true,
    trim: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
    default: 5
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
testimonialSchema.index({ createdAt: -1 });
testimonialSchema.index({ status: 1 });
testimonialSchema.index({ order: 1 });

module.exports = mongoose.model('Testimonial', testimonialSchema);