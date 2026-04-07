const express = require('express');
const router = express.Router();
const { getAllEmailLogs, deleteEmailLog } = require('../controllers/emailLog.controller');

router.get('/', getAllEmailLogs);
router.delete('/:id', deleteEmailLog);

module.exports = router;
