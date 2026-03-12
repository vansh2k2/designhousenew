const express = require('express');
const router = express.Router();
const { getTheme, updateTheme } = require('../controllers/sidebarTheme.controller');

router.get('/', getTheme);
router.put('/', updateTheme);

module.exports = router;
