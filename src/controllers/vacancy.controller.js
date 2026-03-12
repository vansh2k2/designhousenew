const Vacancy = require('../models/Vacancy.model');

// ✅ Get all active vacancies (Public - for frontend)
exports.getActiveVacancies = async (req, res) => {
  try {
    const vacancies = await Vacancy.find({ status: 'active' })
      .sort({ order: 1, createdAt: -1 })
      .select('-__v');

    res.status(200).json({
      success: true,
      count: vacancies.length,
      vacancies: vacancies
    });

  } catch (error) {
    console.error('Get active vacancies error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch vacancies',
      error: error.message
    });
  }
};

// ✅ Get all vacancies (Admin)
exports.getAllVacancies = async (req, res) => {
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
        { title: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
        { experience: { $regex: search, $options: 'i' } }
      ];
    }

    // Status filter
    if (status && status !== 'all') {
      query.status = status;
    }

    // Pagination
    const skip = (page - 1) * limit;
    const total = await Vacancy.countDocuments(query);

    const vacancies = await Vacancy.find(query)
      .sort({ order: 1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select('-__v');

    // Get stats
    const stats = {
      total: await Vacancy.countDocuments(),
      active: await Vacancy.countDocuments({ status: 'active' }),
      inactive: await Vacancy.countDocuments({ status: 'inactive' })
    };

    res.status(200).json({
      success: true,
      data: vacancies,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      },
      stats
    });

  } catch (error) {
    console.error('Get all vacancies error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch vacancies',
      error: error.message
    });
  }
};

// ✅ Get single vacancy by ID
exports.getVacancyById = async (req, res) => {
  try {
    const vacancy = await Vacancy.findById(req.params.id).select('-__v');

    if (!vacancy) {
      return res.status(404).json({
        success: false,
        message: 'Vacancy not found'
      });
    }

    res.status(200).json({
      success: true,
      data: vacancy
    });

  } catch (error) {
    console.error('Get vacancy error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch vacancy',
      error: error.message
    });
  }
};

// ✅ Create vacancy
exports.createVacancy = async (req, res) => {
  try {
    const { 
      title, 
      experience, 
      salary, 
      location, 
      description, 
      requirements, 
      vacancyCount, 
      status, 
      order 
    } = req.body;

    // Validation
    if (!title || !experience || !location) {
      return res.status(400).json({
        success: false,
        message: 'Title, experience, and location are required'
      });
    }

    // Parse requirements if it's a string
    let parsedRequirements = requirements;
    if (typeof requirements === 'string') {
      parsedRequirements = requirements.split('\n').filter(r => r.trim());
    }

    // Create vacancy
    const vacancy = new Vacancy({
      title,
      experience,
      salary: salary || 'Not disclosed',
      location,
      description: description || '',
      requirements: parsedRequirements || [],
      vacancyCount: vacancyCount || 1,
      status: status || 'active',
      order: order || 0
    });

    await vacancy.save();

    res.status(201).json({
      success: true,
      message: 'Vacancy created successfully',
      data: vacancy
    });

  } catch (error) {
    console.error('Create vacancy error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create vacancy',
      error: error.message
    });
  }
};

// ✅ Update vacancy
exports.updateVacancy = async (req, res) => {
  try {
    const { 
      title, 
      experience, 
      salary, 
      location, 
      description, 
      requirements, 
      vacancyCount, 
      status, 
      order 
    } = req.body;

    // Parse requirements if it's a string
    let parsedRequirements = requirements;
    if (typeof requirements === 'string') {
      parsedRequirements = requirements.split('\n').filter(r => r.trim());
    }

    const vacancy = await Vacancy.findByIdAndUpdate(
      req.params.id,
      {
        title,
        experience,
        salary,
        location,
        description,
        requirements: parsedRequirements,
        vacancyCount,
        status,
        order
      },
      { new: true, runValidators: true }
    );

    if (!vacancy) {
      return res.status(404).json({
        success: false,
        message: 'Vacancy not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Vacancy updated successfully',
      data: vacancy
    });

  } catch (error) {
    console.error('Update vacancy error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update vacancy',
      error: error.message
    });
  }
};

// ✅ Delete vacancy
exports.deleteVacancy = async (req, res) => {
  try {
    const vacancy = await Vacancy.findByIdAndDelete(req.params.id);

    if (!vacancy) {
      return res.status(404).json({
        success: false,
        message: 'Vacancy not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Vacancy deleted successfully'
    });

  } catch (error) {
    console.error('Delete vacancy error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete vacancy',
      error: error.message
    });
  }
};

// ✅ Bulk delete vacancies
exports.bulkDeleteVacancies = async (req, res) => {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide vacancy IDs to delete'
      });
    }

    const result = await Vacancy.deleteMany({ _id: { $in: ids } });

    res.status(200).json({
      success: true,
      message: `${result.deletedCount} vacancy(s) deleted successfully`,
      deletedCount: result.deletedCount
    });

  } catch (error) {
    console.error('Bulk delete error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete vacancies',
      error: error.message
    });
  }
};

// ✅ Update vacancy status
exports.updateVacancyStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['active', 'inactive'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const vacancy = await Vacancy.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!vacancy) {
      return res.status(404).json({
        success: false,
        message: 'Vacancy not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Status updated successfully',
      data: vacancy
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