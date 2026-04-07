const mongoose = require('mongoose');

const ClickLogSchema = new mongoose.Schema({
  iconName: {
    type: String,
    required: true,
    index: true
  },
  ipAddress: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('ClickLog', ClickLogSchema);
