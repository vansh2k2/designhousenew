const mongoose = require('mongoose');

const messageTemplateSchema = new mongoose.Schema({
  formType: {
    type: String,
    required: true,
    enum: ['booking', 'career', 'contact'],
    unique: true
  },
  emailSubject: {
    type: String,
    required: true
  },
  emailBody: {
    type: String,
    required: true
  },
  whatsappBody: {
    type: String,
    required: true
  },
  updatedBy: {
    type: String,
    default: 'System'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('MessageTemplate', messageTemplateSchema);
