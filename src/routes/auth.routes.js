const express = require("express");
const router = express.Router();

const { registerAdmin, loginAdmin, verifyAdmin } = require("../controllers/auth.controller");
const { protect } = require("../middleware/auth.middleware");

router.post("/register", registerAdmin);
router.post("/login", loginAdmin);
router.get("/verify", protect, verifyAdmin);

module.exports = router;