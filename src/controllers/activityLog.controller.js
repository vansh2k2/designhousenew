const ActivityLog = require('../models/ActivityLog.model');

// ✅ Get all activity logs with pagination
exports.getAllLogs = async (req, res) => {
    try {
        const { page = 1, limit = 10, search = '', module } = req.query;

        const query = {};
        if (module && module !== 'all') {
            query.module = module;
        }
        if (search) {
            query.$or = [
                { user: { $regex: search, $options: 'i' } },
                { action: { $regex: search, $options: 'i' } },
                { module: { $regex: search, $options: 'i' } },
                { details: { $regex: search, $options: 'i' } }
            ];
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const logs = await ActivityLog.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await ActivityLog.countDocuments(query);

        res.status(200).json({
            success: true,
            data: logs,
            total,
            page: parseInt(page),
            pages: Math.ceil(total / parseInt(limit))
        });

    } catch (error) {
        console.error('Error fetching activity logs:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch activity logs',
            error: error.message
        });
    }
};

// Helper function to create a log (can be called from other controllers)
exports.logActivity = async (user, action, module, details) => {
    try {
        await ActivityLog.create({
            user: user || 'Admin User',
            action,
            module,
            details
        });
    } catch (error) {
        console.error('Error creating activity log:', error);
    }
};
