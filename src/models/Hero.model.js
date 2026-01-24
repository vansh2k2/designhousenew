const mongoose = require('mongoose');

const heroSlideSchema = new mongoose.Schema({
  image: {
    type: String,
    required: true,
  },
  subtitle: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  highlight: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  order: {
    type: Number,
    default: 0,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  schedule: {
    startDate: {
      type: String,
      default: null
    },
    startTime: {
      type: String,
      default: null
    },
    endDate: {
      type: String,
      default: null
    },
    endTime: {
      type: String,
      default: null
    }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('HeroSlide', heroSlideSchema);