const express = require('express');
const router = express.Router();
const Admin = require('../models/Admin.model');
const bcrypt = require('bcryptjs');

// ✅ Create Admin (Username + Password only)
router.post('/create', async (req, res) => {
  try {
    const { username, password, role } = req.body;

    // Check if admin exists
    const existingAdmin = await Admin.findOne({ username });
    if (existingAdmin) {
      return res.status(400).json({ 
        success: false, 
        message: 'Username already exists' 
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = new Admin({
      username,
      password: hashedPassword,
      role: role || 'Editor',
      status: 'Active'
    });

    await admin.save();

    res.status(201).json({
      success: true,
      message: 'Admin created successfully',
      data: {
        _id: admin._id,
        username: admin.username,
        role: admin.role,
        status: admin.status,
        createdAt: admin.createdAt
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// ✅ Get All Admins
router.get('/all', async (req, res) => {
  try {
    const admins = await Admin.find()
      .select('-password')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: admins
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// ✅ Update Admin
router.put('/update/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { username, role, status, password } = req.body;

    const admin = await Admin.findById(id);
    if (!admin) {
      return res.status(404).json({ 
        success: false, 
        message: 'Admin not found' 
      });
    }

    // Update fields
    if (username) admin.username = username;
    if (role) admin.role = role;
    if (status) admin.status = status;
    
    // Update password if provided
    if (password) {
      admin.password = await bcrypt.hash(password, 10);
    }

    await admin.save();

    res.status(200).json({
      success: true,
      message: 'Admin updated successfully',
      data: {
        _id: admin._id,
        username: admin.username,
        role: admin.role,
        status: admin.status
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// ✅ Delete Admin
router.delete('/delete/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const admin = await Admin.findByIdAndDelete(id);
    if (!admin) {
      return res.status(404).json({ 
        success: false, 
        message: 'Admin not found' 
      });
    }

    res.status(200).json({
      success: true,
      message: 'Admin deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// ✅ Change Password (Logged-in admin)
router.put("/change-password", async (req, res) => {
  try {
    const { adminId, currentPassword, newPassword } = req.body;

    if (!adminId || !currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "adminId, currentPassword, newPassword are required",
      });
    }

    const admin = await Admin.findById(adminId);
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    // ✅ check old password
    const isMatch = await bcrypt.compare(currentPassword, admin.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Current password is wrong",
      });
    }

    // ✅ hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    admin.password = hashedNewPassword;
    await admin.save();

    return res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});


module.exports = router;