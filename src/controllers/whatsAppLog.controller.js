const WhatsAppLog = require('../models/WhatsAppLog.model');

// GET all WhatsApp logs with pagination, search, and type filter
exports.getAllWhatsAppLogs = async (req, res) => {
  try {
    const { page = 1, limit = 25, search = '', status = '', type = 'all' } = req.query;
    const skip = (page - 1) * limit;

    let query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { recipient: { $regex: search, $options: 'i' } },
        { message: { $regex: search, $options: 'i' } },
      ];
    }

    if (status) {
      query.status = status;
    }

    if (type === 'admin') {
      query.message = { $regex: 'New Booking Request|New Career Application|New Contact Enquiry|New Project|New Message|New Registration|New Appointment', $options: 'i' };
    } else if (type === 'user') {
      query.message = { $regex: 'Thank you for reaching out|Your request has been received|Successfully registered|Verification successful|Registration confirmed|OTP has been sent|Sent you a message', $options: 'i' };
    } else if (type === 'otp') {
      query.message = { $regex: 'otp|verification code|verify', $options: 'i' };
    } else {
      // Exclude OTP messages from "all" logs view by default
      query.message = { $not: /otp|verification code|verify/i };
    }

    const total = await WhatsAppLog.countDocuments(query);
    const data = await WhatsAppLog.find(query)
      .sort({ sentAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    return res.status(200).json({ success: true, data, total });
  } catch (error) {
    console.error('Error fetching WhatsApp logs:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE a single WhatsApp log
exports.deleteWhatsAppLog = async (req, res) => {
  try {
    await WhatsAppLog.findByIdAndDelete(req.params.id);
    return res.status(200).json({ success: true, message: 'Log deleted' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
