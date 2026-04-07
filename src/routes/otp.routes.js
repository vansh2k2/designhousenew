const express = require('express');
const router = express.Router();
const { sendEmailOtp, verifyEmailOtp, sendWhatsAppOtp, verifyWhatsAppOtp } = require('../controllers/otp.controller');

// Email OTP
router.post('/send-email', sendEmailOtp);
router.post('/verify-email', verifyEmailOtp);

// WhatsApp OTP (Opus Technology)
router.post('/send-whatsapp', sendWhatsAppOtp);
router.post('/verify-whatsapp', verifyWhatsAppOtp);

module.exports = router;
