const express = require('express');
const router = express.Router();
const messageTemplateController = require('../controllers/messageTemplate.controller');

// ✅ Public seed if needed (optional)
router.get('/seed', async (req, res) => {
  await messageTemplateController.seedTemplates();
  res.json({ success: true, message: 'Message templates seeded!' });
});

// ✅ Admin Routes
router.get('/', messageTemplateController.getAllTemplates);
router.put('/:formType', messageTemplateController.updateTemplate);

module.exports = router;
