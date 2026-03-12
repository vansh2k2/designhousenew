const express = require('express');
const router = express.Router();
const vacancyController = require('../controllers/vacancy.controller');

// ✅ CORRECT IMPORT - curly braces use करो
const { protect } = require('../middleware/auth.middleware');

// ✅ Public route - Get active vacancies (for frontend)
router.get('/active', vacancyController.getActiveVacancies);

// ✅ Admin routes
router.get('/', protect, vacancyController.getAllVacancies);
router.get('/:id', protect, vacancyController.getVacancyById);

// ✅ CREATE - Make this route accessible (remove protect if testing without login)
router.post('/', protect, vacancyController.createVacancy);  // Keep protect if you want login required

router.put('/:id', protect, vacancyController.updateVacancy);
router.delete('/:id', protect, vacancyController.deleteVacancy);

// ✅ Bulk operations MUST come BEFORE /:id routes
router.post('/bulk-delete', protect, vacancyController.bulkDeleteVacancies);
router.patch('/:id/status', protect, vacancyController.updateVacancyStatus);

module.exports = router;