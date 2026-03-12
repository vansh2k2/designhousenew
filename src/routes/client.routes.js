const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const clientController = require("../controllers/client.controller");
const { protect } = require("../middleware/auth.middleware"); // ✅ CORRECT IMPORT

// ✅ CREATE UPLOADS FOLDER IF NOT EXISTS
const uploadDir = path.join(__dirname, "../../uploads/clients");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// ✅ MULTER STORAGE CONFIG
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `client-${Date.now()}-${Math.round(
      Math.random() * 1e9
    )}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp|svg/;
    const extname = allowedTypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed!"));
    }
  },
});

// ✅ PUBLIC ROUTES (No Auth Required)
router.get("/active", clientController.getActiveClients);
router.get("/homepage", clientController.getHomepageClients);
router.get("/:id", clientController.getClientById);

// ✅ PROTECTED ROUTES (Auth Required)
router.get("/", protect, clientController.getAllClients);
router.post(
  "/create",
  protect,
  upload.single("image"),
  clientController.createClient
);
router.put(
  "/update/:id",
  protect,
  upload.single("image"),
  clientController.updateClient
);
router.delete("/delete/:id", protect, clientController.deleteClient);
router.post("/bulk-delete", protect, clientController.bulkDeleteClients);

module.exports = router;