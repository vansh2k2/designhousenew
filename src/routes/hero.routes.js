const express = require('express');
const router = express.Router();
const HeroSlide = require('../models/Hero.model');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// ✅ Multer Configuration for Image Upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = 'uploads/hero/';
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'hero-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: function (req, file, cb) {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

// ✅ Get All Hero Slides (Admin Panel)
router.get('/all', async (req, res) => {
  try {
    const slides = await HeroSlide.find()
      .sort({ order: 1, createdAt: -1 });

    res.status(200).json({
      success: true,
      data: slides
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// ✅ Get Active Hero Slides (For Frontend)
router.get('/active', async (req, res) => {
  try {
    const slides = await HeroSlide.find({ isActive: true })
      .sort({ order: 1, createdAt: -1 });

    res.status(200).json({
      success: true,
      data: slides
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// ✅ Create Hero Slide with Schedule
router.post('/create', upload.single('image'), async (req, res) => {
  try {
    const { subtitle, title, highlight, description, order, isActive, schedule } = req.body;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Image is required'
      });
    }

    const imagePath = `/uploads/hero/${req.file.filename}`;

    const slideData = {
      image: imagePath,
      subtitle,
      title,
      highlight,
      description,
      order: order || 0,
      isActive: isActive !== undefined ? isActive : true
    };

    // Add schedule if provided
    if (schedule) {
      try {
        const scheduleData = typeof schedule === 'string' ? JSON.parse(schedule) : schedule;
        if (scheduleData.startDate && scheduleData.startTime) {
          slideData.schedule = scheduleData;
        }
      } catch (e) {
        console.error('Schedule parsing error:', e);
      }
    }

    const slide = new HeroSlide(slideData);
    await slide.save();

    res.status(201).json({
      success: true,
      message: 'Hero slide created successfully',
      data: slide
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// ✅ Update Hero Slide with Schedule
router.put('/update/:id', upload.single('image'), async (req, res) => {
  try {
    const { id } = req.params;
    const { subtitle, title, highlight, description, order, isActive, schedule } = req.body;

    const slide = await HeroSlide.findById(id);
    if (!slide) {
      return res.status(404).json({
        success: false,
        message: 'Hero slide not found'
      });
    }

    // Update fields
    if (subtitle) slide.subtitle = subtitle;
    if (title) slide.title = title;
    if (highlight) slide.highlight = highlight;
    if (description) slide.description = description;
    if (order !== undefined) slide.order = order;
    if (isActive !== undefined) slide.isActive = isActive;

    // Update schedule if provided
    if (schedule) {
      try {
        const scheduleData = typeof schedule === 'string' ? JSON.parse(schedule) : schedule;
        slide.schedule = scheduleData;
      } catch (e) {
        console.error('Schedule parsing error:', e);
      }
    }

    // Update image if new one uploaded
    if (req.file) {
      // Delete old image
      if (slide.image) {
        const oldImagePath = path.join(__dirname, '../..', slide.image);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      slide.image = `/uploads/hero/${req.file.filename}`;
    }

    await slide.save();

    res.status(200).json({
      success: true,
      message: 'Hero slide updated successfully',
      data: slide
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// ✅ Delete Hero Slide
router.delete('/delete/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const slide = await HeroSlide.findById(id);
    if (!slide) {
      return res.status(404).json({
        success: false,
        message: 'Hero slide not found'
      });
    }

    // Delete image file
    if (slide.image) {
      const imagePath = path.join(__dirname, '../..', slide.image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    await HeroSlide.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Hero slide deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// ✅ Toggle Active Status
router.patch('/toggle-status/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const slide = await HeroSlide.findById(id);
    if (!slide) {
      return res.status(404).json({
        success: false,
        message: 'Hero slide not found'
      });
    }

    slide.isActive = !slide.isActive;
    await slide.save();

    res.status(200).json({
      success: true,
      message: `Hero slide ${slide.isActive ? 'activated' : 'deactivated'} successfully`,
      data: slide
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;