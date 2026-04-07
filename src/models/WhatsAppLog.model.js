const mongoose = require('mongoose');

const WhatsAppLogSchema = new mongoose.Schema({
  name: { type: String, default: null },
  recipient: { type: String, required: true },
  message: { type: String, required: true },
  status: { type: String, enum: ['success', 'failed'], default: 'success' },
  error: { type: String, default: null },
  sentAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('WhatsAppLog', WhatsAppLogSchema);
