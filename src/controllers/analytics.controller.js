const ClickLog = require('../models/ClickLog.model');

/**
 * Log a click on a social/float icon
 * POST /api/analytics/log
 */
exports.logClick = async (req, res) => {
  try {
    const { iconName } = req.body;
    const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';

    if (!iconName) {
      return res.status(400).json({ success: false, message: 'Icon name is required' });
    }

    const log = new ClickLog({
      iconName,
      ipAddress
    });

    await log.save();

    res.status(201).json({ success: true });
  } catch (error) {
    console.error('Error logging click:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Get analytics summary and logs for admin
 * GET /api/analytics/stats
 */
exports.getAnalytics = async (req, res) => {
  try {
    const { page = 1, limit = 25, date, startDate, endDate } = req.query;
    const skip = (page - 1) * limit;

    let query = {};

    if (date) {
      const selectedDate = new Date(date);
      selectedDate.setHours(0, 0, 0, 0);
      const nextDay = new Date(selectedDate);
      nextDay.setDate(selectedDate.getDate() + 1);
      query.timestamp = { $gte: selectedDate, $lt: nextDay };
    } else if (startDate && endDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      query.timestamp = { $gte: start, $lte: end };
    } else {
      // Default to "Today" for both stats and logs if no filter provided
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const todayEnd = new Date();
      todayEnd.setHours(23, 59, 59, 999);
      query.timestamp = { $gte: todayStart, $lte: todayEnd };
    }

    // Get stats based on query
    const statsLogs = await ClickLog.find(query);

    const stats = {
      total: statsLogs.length,
      whatsapp: statsLogs.filter(log => log.iconName.toLowerCase().includes('whatsapp')).length,
      call: statsLogs.filter(log => log.iconName.toLowerCase().includes('call')).length,
      bookMeeting: statsLogs.filter(log => log.iconName.toLowerCase().includes('book meeting')).length,
      social: statsLogs.filter(log => 
        !log.iconName.toLowerCase().includes('whatsapp') && 
        !log.iconName.toLowerCase().includes('call') &&
        !log.iconName.toLowerCase().includes('book meeting')
      ).length
    };

    // Get paginated logs (always filtered by same query)
    const logs = await ClickLog.find(query)
      .sort({ timestamp: -1 })
      .skip(parseInt(skip))
      .limit(parseInt(limit));

    const total = await ClickLog.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        stats,
        logs,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};
