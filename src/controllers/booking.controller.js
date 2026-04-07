const Booking = require('../models/Booking.model');
const emailService = require('../services/email.service');
const whatsappService = require('../services/whatsapp.service');

// ✅ Create new booking - PUBLIC ROUTE
exports.createBooking = async (req, res) => {
  try {
    console.log('📝 Booking request received:', req.body);

    const { name, email, phone, company, message } = req.body;

    // Validation
    if (!name || !email || !phone || !message) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, phone, and message are required'
      });
    }

    // Create booking
    const booking = new Booking({
      name,
      email,
      phone,
      company: company || '',
      message,
      status: 'new',
      isRead: false
    });

    await booking.save();
    console.log('✅ Booking saved successfully:', booking._id);

    // Send email notification (don't await to avoid slowing down response)
    emailService.sendBookingEmail({
      name,
      email,
      phone,
      company,
      message
    });

    emailService.sendConfirmationEmail({
      name,
      email,
      message
    });

    // Send WhatsApp notifications (don't await)
    whatsappService.sendBookingWhatsApp({
      name,
      phone,
      company,
      message
    });

    whatsappService.sendConfirmationWhatsApp({
      name,
      phone
    });

    res.status(201).json({
      success: true,
      message: 'Booking request submitted successfully',
      data: booking
    });

  } catch (error) {
    console.error('❌ Create booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit booking request',
      error: error.message
    });
  }
};

// ✅ Get all bookings (Admin)
exports.getAllBookings = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 8, 
      search = '', 
      status = 'all',
      dateFrom,
      dateTo 
    } = req.query;

    // Build query
    let query = {};

    // Search filter
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
        { message: { $regex: search, $options: 'i' } }
      ];
    }

    // Status filter
    if (status && status !== 'all') {
      query.status = status;
    }

    // Date filter
    if (dateFrom || dateTo) {
      query.createdAt = {};
      if (dateFrom) {
        query.createdAt.$gte = new Date(dateFrom);
      }
      if (dateTo) {
        query.createdAt.$lte = new Date(dateTo + 'T23:59:59.999Z');
      }
    }

    // Pagination
    const skip = (page - 1) * limit;
    const total = await Booking.countDocuments(query);

    const bookings = await Booking.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get stats
    const stats = {
      total: await Booking.countDocuments(),
      new: await Booking.countDocuments({ status: 'new' }),
      pending: await Booking.countDocuments({ status: 'pending' }),
      resolved: await Booking.countDocuments({ status: 'resolved' }),
      contacted: await Booking.countDocuments({ status: 'contacted' })
    };

    res.status(200).json({
      success: true,
      data: bookings,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      },
      stats
    });

  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch bookings',
      error: error.message
    });
  }
};

// ✅ Get single booking
exports.getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Mark as read
    if (!booking.isRead) {
      booking.isRead = true;
      await booking.save();
    }

    res.status(200).json({
      success: true,
      data: booking
    });

  } catch (error) {
    console.error('Get booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch booking',
      error: error.message
    });
  }
};

// ✅ Update booking status
exports.updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['new', 'pending', 'resolved', 'contacted'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status, isRead: true },
      { new: true }
    );

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Booking status updated successfully',
      data: booking
    });

  } catch (error) {
    console.error('Update booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update booking',
      error: error.message
    });
  }
};

// ✅ Delete booking
exports.deleteBooking = async (req, res) => {
  try {
    const booking = await Booking.findByIdAndDelete(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Booking deleted successfully'
    });

  } catch (error) {
    console.error('Delete booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete booking',
      error: error.message
    });
  }
};

// ✅ Bulk delete bookings
exports.bulkDeleteBookings = async (req, res) => {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide booking IDs to delete'
      });
    }

    const result = await Booking.deleteMany({ _id: { $in: ids } });

    res.status(200).json({
      success: true,
      message: `${result.deletedCount} booking(s) deleted successfully`,
      deletedCount: result.deletedCount
    });

  } catch (error) {
    console.error('Bulk delete error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete bookings',
      error: error.message
    });
  }
};

// ✅ Bulk update status
exports.bulkUpdateStatus = async (req, res) => {
  try {
    const { ids, status } = req.body;
    const validStatuses = ['new', 'pending', 'resolved', 'contacted'];

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide booking IDs'
      });
    }

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const result = await Booking.updateMany(
      { _id: { $in: ids } },
      { status, isRead: true }
    );

    res.status(200).json({
      success: true,
      message: `${result.modifiedCount} booking(s) updated successfully`,
      modifiedCount: result.modifiedCount
    });

  } catch (error) {
    console.error('Bulk update error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update bookings',
      error: error.message
    });
  }
};