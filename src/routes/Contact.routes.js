const express = require("express");
const router = express.Router();

const {
  createContact,
  getAllContacts,
  getContactById,
  updateContactStatus,
  deleteContact,
  bulkDeleteContacts,
  bulkUpdateStatus,
  getContactStats,
} = require("../controllers/contact.controller");

// ================= PUBLIC ROUTES =================
// POST /api/contacts - Create new contact (FROM WEBSITE)
router.post("/", createContact);

// ================= ADMIN ROUTES =================
// GET /api/contacts - Get all contacts with filters
router.get("/", getAllContacts);

// GET /api/contacts/stats - Get contact statistics
router.get("/stats", getContactStats);

// GET /api/contacts/:id - Get single contact by ID
router.get("/:id", getContactById);

// PATCH /api/contacts/:id/status - Update contact status
router.patch("/:id/status", updateContactStatus);

// DELETE /api/contacts/:id - Delete single contact
router.delete("/:id", deleteContact);

// POST /api/contacts/bulk-delete - Bulk delete contacts
router.post("/bulk-delete", bulkDeleteContacts);

// POST /api/contacts/bulk-update-status - Bulk update status
router.post("/bulk-update-status", bulkUpdateStatus);

module.exports = router;