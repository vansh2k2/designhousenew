const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
    user: {
        type: String,
        required: true,
        default: "Admin User"
    },
    action: {
        type: String,
        enum: ["Created", "Updated", "Deleted", "Logged In"],
        required: true
    },
    module: {
        type: String,
        required: true
    },
    details: {
        type: String,
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('ActivityLog', activityLogSchema);
