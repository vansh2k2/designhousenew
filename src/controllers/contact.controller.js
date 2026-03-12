const Contact = require("../models/Contact.model");

// ✅ Create Contact (PUBLIC - FROM WEBSITE)
exports.createContact = async (req, res) => {
  try {
    console.log("📝 CREATE CONTACT REQUEST");
    console.log("Body:", req.body);

    const { name, email, phone, service, message } = req.body;

    // Validation
    const missingFields = [];
    if (!name || name.trim() === "") missingFields.push("name");
    if (!email || email.trim() === "") missingFields.push("email");
    if (!phone || phone.trim() === "") missingFields.push("phone");
    if (!message || message.trim() === "") missingFields.push("message");

    if (missingFields.length > 0) {
      console.error("❌ Missing required fields:", missingFields);
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(", ")}`,
        missingFields,
      });
    }

    // Create contact
    const contact = await Contact.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      service: service?.trim() || "",
      message: message.trim(),
      status: "new",
      source: "website",
    });

    console.log("✅ Contact created successfully! ID:", contact._id);

    return res.status(201).json({
      success: true,
      message: "Your message has been sent successfully! We'll contact you soon.",
      data: contact,
    });
  } catch (error) {
    console.error("❌ CREATE CONTACT ERROR:", error);

    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: "Validation Error",
        errors,
      });
    }

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to submit contact form",
    });
  }
};

// ✅ Get All Contacts (ADMIN)
exports.getAllContacts = async (req, res) => {
  try {
    const {
      status,
      search,
      page = 1,
      limit = 25,
      sort = "-createdAt",
      dateFrom,
      dateTo,
    } = req.query;

    const query = {};

    // Filter by status
    if (status && status !== "all") {
      query.status = status;
    }

    // Search functionality
    if (search && search.trim() !== "") {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
        { message: { $regex: search, $options: "i" } },
        { service: { $regex: search, $options: "i" } },
      ];
    }

    // Date range filter
    if (dateFrom || dateTo) {
      query.createdAt = {};
      if (dateFrom) {
        query.createdAt.$gte = new Date(dateFrom);
      }
      if (dateTo) {
        const endDate = new Date(dateTo);
        endDate.setHours(23, 59, 59, 999);
        query.createdAt.$lte = endDate;
      }
    }

    // Pagination
    const pageNumber = Math.max(1, parseInt(page));
    const limitNumber = Math.min(100, Math.max(1, parseInt(limit)));
    const skip = (pageNumber - 1) * limitNumber;

    // Fetch contacts
    const contacts = await Contact.find(query)
      .sort(sort)
      .limit(limitNumber)
      .skip(skip)
      .select("-__v");

    const totalContacts = await Contact.countDocuments(query);

    // Get stats
    const stats = await Contact.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    const statusCounts = {
      total: totalContacts,
      new: 0,
      pending: 0,
      contacted: 0,
      resolved: 0,
    };

    stats.forEach((stat) => {
      statusCounts[stat._id] = stat.count;
    });

    res.status(200).json({
      success: true,
      data: contacts,
      stats: statusCounts,
      pagination: {
        currentPage: pageNumber,
        totalPages: Math.ceil(totalContacts / limitNumber),
        totalContacts,
        limit: limitNumber,
        hasNextPage: pageNumber < Math.ceil(totalContacts / limitNumber),
        hasPrevPage: pageNumber > 1,
      },
    });
  } catch (error) {
    console.error("❌ Get all contacts error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch contacts",
    });
  }
};

// ✅ Get Contact by ID (ADMIN)
exports.getContactById = async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Contact not found",
      });
    }

    res.status(200).json({
      success: true,
      data: contact,
    });
  } catch (error) {
    console.error("❌ Get contact by ID error:", error);

    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid contact ID format",
      });
    }

    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch contact",
    });
  }
};

// ✅ Update Contact Status (ADMIN)
exports.updateContactStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    console.log("🔄 Update Contact Status:", id, "->", status);

    // Validate status
    const validStatuses = ["new", "pending", "contacted", "resolved"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status value",
        validStatuses,
      });
    }

    const contact = await Contact.findById(id);

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Contact not found",
      });
    }

    contact.status = status;
    await contact.save();

    console.log("✅ Contact status updated successfully");

    res.status(200).json({
      success: true,
      message: "Contact status updated successfully",
      data: contact,
    });
  } catch (error) {
    console.error("❌ Update contact status error:", error);

    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid contact ID format",
      });
    }

    res.status(500).json({
      success: false,
      message: error.message || "Failed to update contact status",
    });
  }
};

// ✅ Delete Contact (ADMIN)
exports.deleteContact = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("🗑️ Delete Contact Request for ID:", id);

    const contact = await Contact.findById(id);

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Contact not found",
      });
    }

    await contact.deleteOne();

    console.log("✅ Contact deleted successfully:", id);

    res.status(200).json({
      success: true,
      message: "Contact deleted successfully",
      deletedId: id,
    });
  } catch (error) {
    console.error("❌ Delete contact error:", error);

    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid contact ID format",
      });
    }

    res.status(500).json({
      success: false,
      message: error.message || "Failed to delete contact",
    });
  }
};

// ✅ Bulk Delete Contacts (ADMIN)
exports.bulkDeleteContacts = async (req, res) => {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide an array of contact IDs",
      });
    }

    console.log("🗑️ Bulk Delete Request for IDs:", ids);

    const result = await Contact.deleteMany({ _id: { $in: ids } });

    console.log("✅ Bulk delete successful:", result.deletedCount);

    res.status(200).json({
      success: true,
      message: `${result.deletedCount} contact(s) deleted successfully`,
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error("❌ Bulk delete error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to delete contacts",
    });
  }
};

// ✅ Bulk Update Status (ADMIN)
exports.bulkUpdateStatus = async (req, res) => {
  try {
    const { ids, status } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide an array of contact IDs",
      });
    }

    const validStatuses = ["new", "pending", "contacted", "resolved"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status value",
        validStatuses,
      });
    }

    console.log("🔄 Bulk Update Status:", ids, "->", status);

    const result = await Contact.updateMany(
      { _id: { $in: ids } },
      { $set: { status } }
    );

    console.log("✅ Bulk update successful:", result.modifiedCount);

    res.status(200).json({
      success: true,
      message: `${result.modifiedCount} contact(s) updated successfully`,
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    console.error("❌ Bulk update error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to update contacts",
    });
  }
};

// ✅ Get Contact Stats (ADMIN DASHBOARD)
exports.getContactStats = async (req, res) => {
  try {
    console.log("📊 Fetching contact stats...");

    const [totalContacts, statusStats, recentContacts, monthlyStats] =
      await Promise.all([
        Contact.countDocuments(),
        Contact.aggregate([
          {
            $group: {
              _id: "$status",
              count: { $sum: 1 },
            },
          },
        ]),
        Contact.find().sort("-createdAt").limit(10).select("name email phone status createdAt"),
        Contact.aggregate([
          {
            $match: {
              createdAt: {
                $gte: new Date(
                  new Date().setFullYear(new Date().getFullYear() - 1)
                ),
              },
            },
          },
          {
            $group: {
              _id: {
                year: { $year: "$createdAt" },
                month: { $month: "$createdAt" },
              },
              count: { $sum: 1 },
            },
          },
          { $sort: { "_id.year": 1, "_id.month": 1 } },
          { $limit: 12 },
        ]),
      ]);

    const statusCounts = {
      new: 0,
      pending: 0,
      contacted: 0,
      resolved: 0,
    };

    statusStats.forEach((stat) => {
      statusCounts[stat._id] = stat.count;
    });

    res.status(200).json({
      success: true,
      data: {
        totals: {
          totalContacts,
          ...statusCounts,
        },
        recentContacts,
        monthlyStats,
      },
    });
  } catch (error) {
    console.error("❌ Get contact stats error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch contact stats",
    });
  }
};