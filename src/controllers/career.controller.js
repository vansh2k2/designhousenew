const CareerApplication = require('../models/CareerApplication.model');
const { logActivity } = require('./activityLog.controller');
const path = require('path');
const fs = require('fs');
const emailService = require('../services/email.service');
const whatsappService = require('../services/whatsapp.service');

// ✅ Submit career application (Public - from frontend)
exports.submitApplication = async (req, res) => {
  try {
    const { name, phone, email, subject, message } = req.body;

    // Validation
    if (!name || !phone || !email || !message) {
      return res.status(400).json({
        success: false,
        message: 'Name, phone, email, and message are required'
      });
    }

    // Handle file upload (if any)
    let documentPath = null;
    if (req.file) {
      documentPath = `/uploads/career/${req.file.filename}`;
    }

    // Create application
    const application = new CareerApplication({
      name,
      phone,
      email,
      subject: subject || '',
      message,
      document: documentPath,
      status: 'new'
    });

    await application.save();

    // ✅ SEND NOTIFICATIONS (Async)
    const notificationData = {
      name,
      email,
      phone,
      subject: subject || 'General Application',
      message,
      document: documentPath
    };

    // Admin notifications (to career specific admin)
    emailService.sendCareerBookingEmail(notificationData);
    whatsappService.sendCareerBookingWhatsApp(notificationData);

    // Candidate notifications
    emailService.sendCareerConfirmationEmail(notificationData);
    whatsappService.sendCareerConfirmationWhatsApp(notificationData);

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      data: application
    });

  } catch (error) {
    console.error('Submit application error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit application',
      error: error.message
    });
  }
};

// ✅ Get all career applications (Admin)
exports.getAllApplications = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 50, 
      search = '', 
      status = 'all'
    } = req.query;

    // Build query
    let query = {};

    // Search filter
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } }
      ];
    }

    // Status filter
    if (status && status !== 'all') {
      query.status = status;
    }

    // Pagination
    const skip = (page - 1) * limit;
    const total = await CareerApplication.countDocuments(query);

    const applications = await CareerApplication.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select('-__v');

    // Get stats
    const stats = {
      total: await CareerApplication.countDocuments(),
      new: await CareerApplication.countDocuments({ status: 'new' }),
      reviewed: await CareerApplication.countDocuments({ status: 'reviewed' }),
      shortlisted: await CareerApplication.countDocuments({ status: 'shortlisted' }),
      rejected: await CareerApplication.countDocuments({ status: 'rejected' }),
      contacted: await CareerApplication.countDocuments({ status: 'contacted' })
    };

    res.status(200).json({
      success: true,
      data: applications,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      },
      stats
    });

  } catch (error) {
    console.error('Get all applications error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch applications',
      error: error.message
    });
  }
};

// ✅ Get single application by ID
exports.getApplicationById = async (req, res) => {
  try {
    const application = await CareerApplication.findById(req.params.id).select('-__v');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    res.status(200).json({
      success: true,
      data: application
    });

  } catch (error) {
    console.error('Get application error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch application',
      error: error.message
    });
  }
};

// ✅ Update application status
exports.updateApplicationStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['new', 'reviewed', 'shortlisted', 'rejected', 'contacted'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const updatedBy = req.body.updatedBy || "Admin User";
    const application = await CareerApplication.findByIdAndUpdate(
      req.params.id,
      { status, updatedBy },
      { new: true }
    );

    if (application) {
      await logActivity(req.body.updatedBy || "Admin User", "Updated", "Careers", `Updated application status for: ${application.name}`);
    }

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Status updated successfully',
      data: application
    });

  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update status',
      error: error.message
    });
  }
};

// ✅ Delete application
exports.deleteApplication = async (req, res) => {
  try {
    const application = await CareerApplication.findByIdAndDelete(req.params.id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    const updatedBy = req.query.updatedBy || req.body.updatedBy || "Admin User";
    await logActivity(updatedBy, "Deleted", "Careers", `Deleted career application from: ${application.name}`);

    // Delete associated file if exists
    if (application.document) {
      const filePath = path.join(__dirname, '..', '..', application.document);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    res.status(200).json({
      success: true,
      message: 'Application deleted successfully'
    });

  } catch (error) {
    console.error('Delete application error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete application',
      error: error.message
    });
  }
};

// ✅ Bulk delete applications
exports.bulkDeleteApplications = async (req, res) => {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide application IDs to delete'
      });
    }

    // Get applications to delete files
    const applications = await CareerApplication.find({ _id: { $in: ids } });

    // Delete files
    applications.forEach(app => {
      if (app.document) {
        const filePath = path.join(__dirname, '..', '..', app.document);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
    });

    // Delete applications
    const result = await CareerApplication.deleteMany({ _id: { $in: ids } });

    const updatedBy = req.body.updatedBy || req.query.updatedBy || "Admin User";
    await logActivity(updatedBy, "Deleted (Bulk)", "Careers", `Bulk deleted ${result.deletedCount} career applications`);

    res.status(200).json({
      success: true,
      message: `${result.deletedCount} application(s) deleted successfully`,
      deletedCount: result.deletedCount
    });

  } catch (error) {
    console.error('Bulk delete error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete applications',
      error: error.message
    });
  }
};

// ✅ Bulk update status
exports.bulkUpdateStatus = async (req, res) => {
  try {
    const { ids, status } = req.body;
    const validStatuses = ['new', 'reviewed', 'shortlisted', 'rejected', 'contacted'];

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide application IDs to update'
      });
    }

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const updatedBy = req.body.updatedBy || "Admin User";
    const result = await CareerApplication.updateMany(
      { _id: { $in: ids } },
      { status, updatedBy }
    );
    
    await logActivity(updatedBy, "Updated Status (Bulk)", "Careers", `Bulk updated ${result.modifiedCount} applications to ${status}`);

    res.status(200).json({
      success: true,
      message: `${result.modifiedCount} application(s) updated successfully`,
      modifiedCount: result.modifiedCount
    });

  } catch (error) {
    console.error('Bulk update error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update applications',
      error: error.message
    });
  }
};