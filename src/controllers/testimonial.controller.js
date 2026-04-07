const Testimonial = require('../models/Testimonial.model');
const { logActivity } = require('./activityLog.controller');

// ✅ Get all active testimonials (Public - for frontend)
exports.getActiveTestimonials = async (req, res) => {
  try {
    const testimonials = await Testimonial.find({ status: 'active' })
      .sort({ order: 1, createdAt: -1 })
      .select('-__v');

    res.status(200).json({
      success: true,
      count: testimonials.length,
      testimonials: testimonials
    });

  } catch (error) {
    console.error('Get active testimonials error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch testimonials',
      error: error.message
    });
  }
};

// ✅ Get all testimonials (Admin)
exports.getAllTestimonials = async (req, res) => {
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
        { role: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
        { feedback: { $regex: search, $options: 'i' } }
      ];
    }

    // Status filter
    if (status && status !== 'all') {
      query.status = status;
    }

    // Pagination
    const skip = (page - 1) * limit;
    const total = await Testimonial.countDocuments(query);

    const testimonials = await Testimonial.find(query)
      .sort({ order: 1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select('-__v');

    // Get stats
    const stats = {
      total: await Testimonial.countDocuments(),
      active: await Testimonial.countDocuments({ status: 'active' }),
      inactive: await Testimonial.countDocuments({ status: 'inactive' })
    };

    res.status(200).json({
      success: true,
      data: testimonials,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      },
      stats
    });

  } catch (error) {
    console.error('Get all testimonials error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch testimonials',
      error: error.message
    });
  }
};

// ✅ Get single testimonial by ID
exports.getTestimonialById = async (req, res) => {
  try {
    const testimonial = await Testimonial.findById(req.params.id).select('-__v');

    if (!testimonial) {
      return res.status(404).json({
        success: false,
        message: 'Testimonial not found'
      });
    }

    res.status(200).json({
      success: true,
      data: testimonial
    });

  } catch (error) {
    console.error('Get testimonial error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch testimonial',
      error: error.message
    });
  }
};

// ✅ Create testimonial
exports.createTestimonial = async (req, res) => {
  try {
    const { name, role, company, feedback, rating, status, order } = req.body;

    // Validation
    if (!name || !role || !feedback) {
      return res.status(400).json({
        success: false,
        message: 'Name, role, and feedback are required'
      });
    }

    // Create testimonial
    const testimonial = new Testimonial({
      name,
      role,
      company: company || '',
      feedback,
      rating: rating || 5,
      status: status || 'active',
      order: order || 0,
      updatedBy: req.body.updatedBy || "Admin User"
    });

    await testimonial.save();

    await logActivity(req.body.updatedBy || "Admin User", "Created", "Testimonial", `Added testimonial from: ${name}`);

    res.status(201).json({
      success: true,
      message: 'Testimonial created successfully',
      data: testimonial
    });

  } catch (error) {
    console.error('Create testimonial error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create testimonial',
      error: error.message
    });
  }
};

// ✅ Update testimonial
exports.updateTestimonial = async (req, res) => {
  try {
    const { name, role, company, feedback, rating, status, order } = req.body;

    const testimonial = await Testimonial.findByIdAndUpdate(
      req.params.id,
      {
        name,
        role,
        company,
        feedback,
        rating,
        status,
        order,
        updatedBy: req.body.updatedBy || "Admin User"
      },
      { new: true, runValidators: true }
    );

    if (testimonial) {
      await logActivity(req.body.updatedBy || "Admin User", "Updated", "Testimonial", `Updated testimonial from: ${testimonial.name}`);
    }

    if (!testimonial) {
      return res.status(404).json({
        success: false,
        message: 'Testimonial not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Testimonial updated successfully',
      data: testimonial
    });

  } catch (error) {
    console.error('Update testimonial error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update testimonial',
      error: error.message
    });
  }
};

// ✅ Delete testimonial
exports.deleteTestimonial = async (req, res) => {
  try {
    const testimonial = await Testimonial.findByIdAndDelete(req.params.id);

    if (!testimonial) {
      return res.status(404).json({
        success: false,
        message: 'Testimonial not found'
      });
    }

    const updatedBy = req.query.updatedBy || req.body.updatedBy || "Admin User";
    await logActivity(updatedBy, "Deleted", "Testimonial", `Deleted testimonial from: ${testimonial.name}`);

    res.status(200).json({
      success: true,
      message: 'Testimonial deleted successfully'
    });

  } catch (error) {
    console.error('Delete testimonial error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete testimonial',
      error: error.message
    });
  }
};

// ✅ Bulk delete testimonials
exports.bulkDeleteTestimonials = async (req, res) => {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide testimonial IDs to delete'
      });
    }

    const result = await Testimonial.deleteMany({ _id: { $in: ids } });

    const updatedBy = req.body.updatedBy || req.query.updatedBy || "Admin User";
    await logActivity(updatedBy, "Deleted (Bulk)", "Testimonial", `Bulk deleted ${result.deletedCount} testimonials`);

    res.status(200).json({
      success: true,
      message: `${result.deletedCount} testimonial(s) deleted successfully`,
      deletedCount: result.deletedCount
    });

  } catch (error) {
    console.error('Bulk delete error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete testimonials',
      error: error.message
    });
  }
};

// ✅ Update testimonial status
exports.updateTestimonialStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['active', 'inactive'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const updatedBy = req.body.updatedBy || "Admin User";
    const testimonial = await Testimonial.findByIdAndUpdate(
      req.params.id,
      { status, updatedBy },
      { new: true }
    );
    
    if (testimonial) {
      await logActivity(updatedBy, "Updated Status", "Testimonial", `Changed status of ${testimonial.name} to ${status}`);
    }

    if (!testimonial) {
      return res.status(404).json({
        success: false,
        message: 'Testimonial not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Status updated successfully',
      data: testimonial
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