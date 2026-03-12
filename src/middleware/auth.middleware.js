const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin.model");

const protect = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    } else if (req.cookies?.adminToken) {
      token = req.cookies.adminToken;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authorized",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const admin = await Admin.findById(decoded.id).select("-password");
    if (!admin || !admin.isActive) {
      return res.status(401).json({
        success: false,
        message: "Admin not found or inactive",
      });
    }

    req.user = admin;
    next();
  } catch (err) {
    next(err); // ✅ IMPORTANT
  }
};

const adminOnly = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false });
  }
  next();
};

module.exports = {
  protect,
  adminOnly,
};
