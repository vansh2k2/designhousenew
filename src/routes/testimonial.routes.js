const express = require('express');
const router = express.Router();
const testimonialController = require('../controllers/testimonial.controller');

// ✅ CORRECT IMPORT - curly braces use करें
const { protect } = require('../middleware/auth.middleware');

// ✅ Public route - Get active testimonials (for frontend)
router.get('/active', testimonialController.getActiveTestimonials);

// ✅ Admin routes - Protected
router.get('/', protect, testimonialController.getAllTestimonials);
router.get('/:id', protect, testimonialController.getTestimonialById);
router.post('/', protect, testimonialController.createTestimonial);
router.put('/:id', protect, testimonialController.updateTestimonial);
router.delete('/:id', protect, testimonialController.deleteTestimonial);
router.post('/bulk-delete', protect, testimonialController.bulkDeleteTestimonials);
router.patch('/:id/status', protect, testimonialController.updateTestimonialStatus);

module.exports = router;