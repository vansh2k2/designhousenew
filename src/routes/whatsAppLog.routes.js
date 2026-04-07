const express = require('express');
const router = express.Router();
const { getAllWhatsAppLogs, deleteWhatsAppLog } = require('../controllers/whatsAppLog.controller');

router.get('/', getAllWhatsAppLogs);
router.delete('/:id', deleteWhatsAppLog);

module.exports = router;
