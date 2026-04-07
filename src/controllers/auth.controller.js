const Admin = require("../models/Admin.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { logActivity } = require("./activityLog.controller");

// ✅ Admin Register (1 time)
exports.registerAdmin = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Username, Email & Password required" });
    }

    const exists = await Admin.findOne({ $or: [{ username }, { email }] });
    if (exists) {
      return res
        .status(400)
        .json({ success: false, message: "Admin already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = await Admin.create({
      username,
      email,
      password: hashedPassword,
    });

    return res.status(201).json({
      success: true,
      message: "Admin Registered Successfully",
      admin: {
        id: admin._id,
        username: admin.username,
        email: admin.email,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Admin Login (username based)
exports.loginAdmin = async (req, res) => {
  try {
    const { username, password } = req.body;

    const admin = await Admin.findOne({ username });
    if (!admin) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid Username or Password" });
    }

    const match = await bcrypt.compare(password, admin.password);
    if (!match) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid Username or Password" });
    }

    // ✅ Update lastLogin
    admin.lastLogin = new Date();
    await admin.save();

    const token = jwt.sign(
      {
        id: admin._id,
        role: admin.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    await logActivity(admin.username, "Logged In", "Auth", `Admin user ${admin.username} logged in`);


    return res.json({
      success: true,
      message: "Login Successful",
      token,
      admin: {
        id: admin._id,
        username: admin.username,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Admin Verify (Token checking)
exports.verifyAdmin = async (req, res) => {
  try {
    // req.user is already set by protect middleware
    return res.json({
      success: true,
      admin: {
        id: req.user._id,
        username: req.user.username,
        email: req.user.email,
        role: req.user.role,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
