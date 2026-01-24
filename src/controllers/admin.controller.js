const bcrypt = require("bcryptjs");
const Admin = require("../models/Admin.model");

// ✅ Change Password API
exports.changePassword = async (req, res) => {
  try {
    const { adminId, currentPassword, newPassword } = req.body;

    if (!adminId || !currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const admin = await Admin.findById(adminId);
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    // ✅ current password verify
    const isMatch = await bcrypt.compare(currentPassword, admin.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    // ✅ hash new password
    const hashed = await bcrypt.hash(newPassword, 10);

    admin.password = hashed;
    await admin.save();

    return res.status(200).json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    console.log("CHANGE PASSWORD ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
