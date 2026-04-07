const EmailLog = require('../models/EmailLog.model');

// GET all email logs with pagination, search, and type filter
exports.getAllEmailLogs = async (req, res) => {
  try {
    const { page = 1, limit = 25, search = '', type = 'all' } = req.query;
    const skip = (page - 1) * limit;

    let query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { recipient: { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } },
        { message: { $regex: search, $options: 'i' } },
      ];
    }

    if (type === 'admin') {
      query.subject = { $regex: '^New (Consultation|Career|Customer|Website|Booking)', $options: 'i' };
    } else if (type === 'user') {
      query.subject = { $regex: 'Received Your Request|Application Received|Thank You for Reaching Out', $options: 'i' };
    } else {
      // Exclude OTP emails from "all" logs view by default
      query.subject = { $not: /OTP|Verification|Verification Code|Verify Email/i };
    }

    const total = await EmailLog.countDocuments(query);
    const data = await EmailLog.find(query)
      .sort({ sentAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    return res.status(200).json({ success: true, data, total });
  } catch (error) {
    console.error('Error fetching email logs:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE a single email log
exports.deleteEmailLog = async (req, res) => {
  try {
    await EmailLog.findByIdAndDelete(req.params.id);
    return res.status(200).json({ success: true, message: 'Log deleted' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
