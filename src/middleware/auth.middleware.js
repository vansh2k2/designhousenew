const jwt = require("jsonwebtoken");

const protect = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // ✅ token format: Bearer TOKEN
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, message: "Not Authorized" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.admin = decoded; // { id, email }
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: "Invalid Token" });
  }
};

module.exports = protect;
