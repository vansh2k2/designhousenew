const mongoose = require('mongoose');

const EmailLogSchema = new mongoose.Schema({
  name: { type: String, default: null },
  recipient: { type: String, required: true },
  phone: { type: String, default: null },
  subject: { type: String, required: true },
  message: { type: String, default: null },
  status: { type: String, enum: ['success', 'failed'], default: 'success' },
  error: { type: String, default: null },
  sentAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('EmailLog', EmailLogSchema);
