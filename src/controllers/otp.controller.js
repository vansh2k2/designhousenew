const nodemailer = require('nodemailer');
const axios = require('axios');
const Settings = require('../models/Settings.model');
const whatsappService = require('../services/whatsapp.service');

// In-memory OTP store: { "email:<addr>": {otp, expiresAt}, "phone:<num>": {otp, expiresAt} }
const otpStore = {};

const getOtpSettings = async () => {
    let settings = await Settings.findOne();
    if (settings && settings.otpSettings) {
        return settings.otpSettings;
    }
    // Fallback to .env values
    return {
        opusApiKey: process.env.OPUS_API_KEY || '001d27c3a67d42099d71c079cd1bce76',
        opusApiUrl: process.env.OPUS_API_URL || 'http://api.opustechnology.in/wapp/v2/api/send',
        fromEmail: process.env.FROM_EMAIL || 'noreply@designhouse.org',
        fromName: process.env.FROM_NAME || 'Design House',
        smtpUser: process.env.SMTP_USER || 'manishsirohi023@gmail.com',
        smtpPass: process.env.SMTP_PASS || '',
        smtpHost: process.env.SMTP_HOST || 'smtp.gmail.com',
        smtpPort: process.env.SMTP_PORT || '465'
    };
};

const createTransporter = (s) => nodemailer.createTransport({
    host: s.smtpHost,
    port: parseInt(s.smtpPort),
    secure: parseInt(s.smtpPort) === 465,
    auth: { user: s.smtpUser, pass: s.smtpPass },
});

const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

// ✅ SEND EMAIL OTP (SMTP)
exports.sendEmailOtp = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return res.status(400).json({ success: false, message: 'Please provide a valid email address' });
        }

        const s = await getOtpSettings();
        const otp = generateOtp();
        otpStore[`email:${email.toLowerCase()}`] = { otp, expiresAt: Date.now() + 10 * 60 * 1000 };

        await createTransporter(s).sendMail({
            from: `"${s.fromName}" <${s.fromEmail || s.smtpUser}>`,
            to: email,
            subject: 'Your Verification OTP - Design House',
            html: `
                <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;border:1px solid #e0e0e0;border-radius:8px;overflow:hidden;">
                    <div style="background:#134698;padding:24px;text-align:center;">
                        <h1 style="color:#fff;margin:0;font-size:22px;letter-spacing:1px;">DESIGN HOUSE</h1>
                        <p style="color:#DE802B;margin:4px 0 0;font-size:12px;letter-spacing:2px;">EMAIL VERIFICATION</p>
                    </div>
                    <div style="padding:32px;text-align:center;background:#fff;">
                        <p style="color:#555;font-size:15px;margin-bottom:24px;">Use the OTP below to verify your email. Valid for <strong>10 minutes</strong>.</p>
                        <div style="display:inline-block;background:#f4f7fb;border:2px dashed #134698;border-radius:8px;padding:18px 40px;margin-bottom:24px;">
                            <span style="font-size:36px;font-weight:bold;color:#134698;letter-spacing:10px;">${otp}</span>
                        </div>
                        <p style="color:#999;font-size:12px;margin-top:16px;">If you didn't request this, ignore this email.</p>
                    </div>
                    <div style="background:#f9f9f9;padding:14px;text-align:center;border-top:1px solid #eee;">
                        <p style="margin:0;font-size:11px;color:#aaa;">© ${new Date().getFullYear()} Design House India Pvt. Ltd.</p>
                    </div>
                </div>`
        });
        console.log(`✅ Email OTP sent to ${email}`);
        return res.status(200).json({ success: true, message: 'OTP sent to your email address' });
    } catch (error) {
        console.error('❌ Send Email OTP error:', error);
        return res.status(500).json({ success: false, message: 'Failed to send OTP. Please try again.' });
    }
};

// ✅ VERIFY EMAIL OTP
exports.verifyEmailOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;
        if (!email || !otp) return res.status(400).json({ success: false, message: 'Email and OTP are required' });
        const key = `email:${email.toLowerCase()}`;
        const record = otpStore[key];
        if (!record) return res.status(400).json({ success: false, message: 'No OTP found. Please request a new one.' });
        if (Date.now() > record.expiresAt) {
            delete otpStore[key];
            return res.status(400).json({ success: false, message: 'OTP has expired. Please request a new one.' });
        }
        if (record.otp !== otp.toString()) return res.status(400).json({ success: false, message: 'Invalid OTP. Please try again.' });
        delete otpStore[key];
        return res.status(200).json({ success: true, message: 'Email verified successfully!' });
    } catch (error) {
        console.error('❌ Verify Email OTP error:', error);
        return res.status(500).json({ success: false, message: 'Failed to verify OTP. Please try again.' });
    }
};

// ✅ SEND WHATSAPP OTP (Opus Technology API)
exports.sendWhatsAppOtp = async (req, res) => {
    try {
        const { mobile } = req.body;
        if (!mobile || !/^[0-9]{10}$/.test(mobile.replace(/[^0-9]/g, ''))) {
            return res.status(400).json({ success: false, message: 'Please provide a valid 10-digit mobile number' });
        }

        const s = await getOtpSettings();
        const cleanMobile = mobile.replace(/[^0-9]/g, '');
        const otp = generateOtp();
        otpStore[`phone:${cleanMobile}`] = { otp, expiresAt: Date.now() + 10 * 60 * 1000 };

        const msg = `Your Design House verification OTP is: *${otp}*. Valid for 10 minutes. Do not share with anyone.`;
        
        // Use external service to send WhatsApp OTP
        await whatsappService.sendWhatsAppMessage(cleanMobile, msg);
        return res.status(200).json({ success: true, message: 'OTP sent to your WhatsApp number' });
    } catch (error) {
        console.error('❌ Send WhatsApp OTP error:', error);
        return res.status(500).json({ success: false, message: 'Failed to send WhatsApp OTP. Please try again.' });
    }
};

// ✅ VERIFY WHATSAPP OTP
exports.verifyWhatsAppOtp = async (req, res) => {
    try {
        const { mobile, otp } = req.body;
        if (!mobile || !otp) return res.status(400).json({ success: false, message: 'Mobile and OTP are required' });
        const cleanMobile = mobile.replace(/[^0-9]/g, '');
        const key = `phone:${cleanMobile}`;
        const record = otpStore[key];
        if (!record) return res.status(400).json({ success: false, message: 'No OTP found. Please request a new one.' });
        if (Date.now() > record.expiresAt) {
            delete otpStore[key];
            return res.status(400).json({ success: false, message: 'OTP has expired. Please request a new one.' });
        }
        if (record.otp !== otp.toString()) return res.status(400).json({ success: false, message: 'Invalid OTP. Please try again.' });
        delete otpStore[key];
        return res.status(200).json({ success: true, message: 'Phone verified successfully!' });
    } catch (error) {
        console.error('❌ Verify WhatsApp OTP error:', error);
        return res.status(500).json({ success: false, message: 'Failed to verify OTP. Please try again.' });
    }
};
