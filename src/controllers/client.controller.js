const Client = require("../models/Client.model");
const { logActivity } = require("./activityLog.controller");
const fs = require("fs");
const path = require("path");

// ✅ GET ALL CLIENTS
exports.getAllClients = async (req, res) => {
  try {
    const clients = await Client.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: clients,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ✅ GET ACTIVE CLIENTS ONLY (FOR FRONTEND)
exports.getActiveClients = async (req, res) => {
  try {
    const clients = await Client.find({ status: "Active" }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      data: clients,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ✅ GET HOMEPAGE CLIENTS (ACTIVE + SHOWHOMEPAGE)
exports.getHomepageClients = async (req, res) => {
  try {
    const clients = await Client.find({
      status: "Active",
      showOnHomepage: true,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: clients,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ✅ GET SINGLE CLIENT BY ID
exports.getClientById = async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);

    if (!client) {
      return res.status(404).json({
        success: false,
        message: "Client not found",
      });
    }

    res.status(200).json({
      success: true,
      data: client,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ✅ CREATE NEW CLIENT
exports.createClient = async (req, res) => {
  try {
    const { name, url, altText, status, showOnHomepage } = req.body;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Image is required",
      });
    }

    const imagePath = `/uploads/clients/${req.file.filename}`;

    const client = await Client.create({
      name,
      url: url || "#",
      image: imagePath,
      altText: altText || "Client Logo",
      status: status || "Active",
      showOnHomepage: showOnHomepage === "true" || showOnHomepage === true,
      updatedBy: req.body.updatedBy || "Admin User"
    });

    await logActivity(req.body.updatedBy || "Admin User", "Created", "Client", `Added client: ${client.name}`);

    res.status(201).json({
      success: true,
      message: "Client created successfully",
      data: client,
    });
  } catch (error) {
    // Delete uploaded file if error
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ✅ UPDATE CLIENT
exports.updateClient = async (req, res) => {
  try {
    const { name, url, altText, status, showOnHomepage } = req.body;
    const client = await Client.findById(req.params.id);

    if (!client) {
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(404).json({
        success: false,
        message: "Client not found",
      });
    }

    // Update image if new file uploaded
    if (req.file) {
      // Delete old image
      try {
        const oldImageRelativePath = client.image.startsWith('/') ? client.image.substring(1) : client.image;
        const oldImagePath = path.join(__dirname, "../../", oldImageRelativePath);
        
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      } catch (err) {
        console.error("Error deleting old image:", err.message);
      }

      client.image = `/uploads/clients/${req.file.filename}`;
    }

    // Update fields only if they are provided in req.body
    if (name !== undefined) client.name = name;
    if (url !== undefined) client.url = url;
    if (altText !== undefined) client.altText = altText;
    if (status !== undefined) client.status = status;
    
    if (showOnHomepage !== undefined) {
      client.showOnHomepage = showOnHomepage === "true" || showOnHomepage === true;
    }
    
    client.updatedBy = req.body.updatedBy || "Admin User";

    await client.save();
    
    await logActivity(req.body.updatedBy || "Admin User", "Updated", "Client", `Updated client: ${client.name}`);

    res.status(200).json({
      success: true,
      message: "Client updated successfully",
      data: client,
    });
  } catch (error) {
    if (req.file) fs.unlinkSync(req.file.path);
    console.error("Update Client Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ✅ DELETE CLIENT
exports.deleteClient = async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);

    if (!client) {
      return res.status(404).json({
        success: false,
        message: "Client not found",
      });
    }

    // Delete image file
    const imagePath = path.join(__dirname, "../../", client.image);
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }

    const updatedBy = req.query.updatedBy || req.body.updatedBy || "Admin User";
    await Client.findByIdAndDelete(req.params.id);
    
    await logActivity(updatedBy, "Deleted", "Client", `Deleted client: ${client.name}`);

    res.status(200).json({
      success: true,
      message: "Client deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ✅ BULK DELETE CLIENTS
exports.bulkDeleteClients = async (req, res) => {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide client IDs to delete",
      });
    }

    const clients = await Client.find({ _id: { $in: ids } });

    // Delete all images
    clients.forEach((client) => {
      const imagePath = path.join(__dirname, "../../", client.image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    });

    await Client.deleteMany({ _id: { $in: ids } });

    res.status(200).json({
      success: true,
      message: `${clients.length} clients deleted successfully`,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};