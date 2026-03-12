const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth.middleware");

const {
  createBooking,        // ✅ ADD THIS IMPORT
  getAllBookings,
  deleteBooking,
  updateBookingStatus,
  bulkDeleteBookings,
  bulkUpdateStatus,
} = require("../controllers/booking.controller");

// ✅ PUBLIC ROUTE - No authentication needed
router.post("/", createBooking);

// ✅ PROTECTED ROUTES - Admin only
router.get("/", protect, getAllBookings);
router.delete("/:id", protect, deleteBooking);
router.patch("/:id/status", protect, updateBookingStatus);
router.post("/bulk-delete", protect, bulkDeleteBookings);
router.post("/bulk-update-status", protect, bulkUpdateStatus);

module.exports = router;