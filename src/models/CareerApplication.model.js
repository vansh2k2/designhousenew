const mongoose = require('mongoose');

const careerApplicationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  phone: {
    type: String,
    required: [true, 'Phone is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    trim: true,
    lowercase: true
  },
  subject: {
    type: String,
    trim: true
  },
  message: {
    type: String,
    required: [true, 'Message is required'],
    trim: true
  },
  document: {
    type: String, // File path
    default: null
  },
  status: {
    type: String,
    enum: ['new', 'reviewed', 'shortlisted', 'rejected', 'contacted'],
    default: 'new'
  }
}, {
  timestamps: true
});

// Index for faster queries
careerApplicationSchema.index({ createdAt: -1 });
careerApplicationSchema.index({ status: 1 });
careerApplicationSchema.index({ email: 1 });

module.exports = mongoose.model('CareerApplication', careerApplicationSchema);