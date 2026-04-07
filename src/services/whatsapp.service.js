const axios = require('axios');
const Settings = require('../models/Settings.model');
const WhatsAppLog = require('../models/WhatsAppLog.model');
const MessageTemplate = require('../models/MessageTemplate.model');

// Helper: Replace placeholders in template
const replacePlaceholders = (template, data) => {
  if (!template) return "";
  let content = template;
  Object.keys(data).forEach((key) => {
    const value = data[key] || "";
    const regex = new RegExp(`\\[\\[${key.toUpperCase()}\\]\\]`, "g");
    content = content.replace(regex, value);
  });
  return content;
};

// Helper to get configuration
const getWhatsAppConfig = async () => {
    let settings = await Settings.findOne();
    const s = settings?.otpSettings || {};
    
    return {
        apiKey: s.opusApiKey || process.env.OPUS_API_KEY || '001d27c3a67d42099d71c079cd1bce76',
        apiUrl: s.opusApiUrl || process.env.OPUS_API_URL || 'http://api.opustechnology.in/wapp/v2/api/send'
    };
};

/**
 * Generic function to send WhatsApp message via Opus Technology API
 */
exports.sendWhatsAppMessage = async (mobile, message, name = null) => {
    let status = 'success';
    let errorMsg = null;
    let formattedMobile = mobile;
    
    try {
        const config = await getWhatsAppConfig();
        const cleanMobile = mobile.replace(/[^0-9]/g, '');
        formattedMobile = cleanMobile.length === 10 ? `91${cleanMobile}` : cleanMobile;

        const url = `${config.apiUrl}?apikey=${config.apiKey}&mobile=${formattedMobile}&msg=${encodeURIComponent(message)}`;
        
        console.log(`📤 Sending WhatsApp to ${formattedMobile}...`);
        const response = await axios.get(url);
        console.log(`✅ WhatsApp Response:`, response.data);
        
    } catch (error) {
        console.error('❌ WhatsApp Service Error:', error.response?.data || error.message);
        status = 'failed';
        errorMsg = error.message;
    }

    // ✅ Always log to DB
    try {
        await WhatsAppLog.create({
            name: name || null,
            recipient: formattedMobile,
            message,
            status,
            error: errorMsg
        });
    } catch (logErr) {
        console.error('❌ Failed to save WhatsApp log:', logErr.message);
    }

    return status === 'success' ? { success: true } : { success: false, error: errorMsg };
};

/**
 * Send lead notification to Admin (Hardcoded template)
 */
exports.sendBookingWhatsApp = async (bookingData) => {
    const adminMobile = process.env.ADMIN_WHATSAPP || '9569786142';
    const { name, phone, message, company } = bookingData;

    const adminMsg = `*🚀 New Booking Request — Design House*\n\n` +
                   `*Name:* ${name}\n` +
                   `*Phone:* ${phone}\n` +
                   (company ? `*Company:* ${company}\n` : '') +
                   `*Message:* ${message}\n\n` +
                   `_Please follow up with the lead promptly._`;
    
    return await exports.sendWhatsAppMessage(adminMobile, adminMsg, name);
};

/**
 * Send confirmation thank you message to User (Dynamic Template)
 */
exports.sendConfirmationWhatsApp = async (bookingData) => {
    const { name, phone, message } = bookingData;
    
    const template = await MessageTemplate.findOne({ formType: 'booking' });
    let userMsg = `Hello *${name}*,\n\nThank you for reaching out to *Design House*! 🏛️ We have received your consultation request and our team will contact you within *24 business hours*.\n\nBest Regards,\n*Design House Team*`;

    if (template) {
        userMsg = replacePlaceholders(template.whatsappBody, { name, phone, message });
    }

    return await exports.sendWhatsAppMessage(phone, userMsg, name);
};

/**
 * Send job application notification to Career Admin
 */
exports.sendCareerBookingWhatsApp = async (applicationData) => {
    const adminMobile = process.env.CAREER_ADMIN_WHATSAPP || process.env.ADMIN_WHATSAPP || '9569786142';
    const { name, phone, subject } = applicationData;

    const adminMsg = `*💼 New Career Application — Design House*\n\n` +
                   `*Candidate:* ${name}\n` +
                   `*Phone:* ${phone}\n` +
                   (subject ? `*Position:* ${subject}\n` : '') +
                   `\n_New talent application received via website. Please review the CV in the admin panel._`;
    
    return await exports.sendWhatsAppMessage(adminMobile, adminMsg, name);
};

/**
 * Send application confirmation to Candidate (Dynamic Template)
 */
exports.sendCareerConfirmationWhatsApp = async (applicationData) => {
    const { name, phone, subject } = applicationData;
    
    const template = await MessageTemplate.findOne({ formType: 'career' });
    let userMsg = `Hello *${name}*,\n\nThank you for applying to *Design House*! 🏛️ We have successfully received your application. Our talent team will review your profile and contact you if it's a match.\n\nBest Regards,\n*Talent Team, Design House*`;

    if (template) {
        userMsg = replacePlaceholders(template.whatsappBody, { name, phone, subject: subject || 'Not specified' });
    }

    return await exports.sendWhatsAppMessage(phone, userMsg, name);
};

/**
 * Send contact enquiry notification to Admin
 */
exports.sendContactAdminWhatsApp = async (contactData) => {
    const adminMobile = process.env.CONTACT_ADMIN_WHATSAPP || process.env.ADMIN_WHATSAPP || '9569786142';
    const { name, phone, service } = contactData;

    const adminMsg = `*🏠 New Contact Enquiry — Design House*\n\n` +
                   `*Name:* ${name}\n` +
                   `*Phone:* ${phone}\n` +
                   (service ? `*Interested In:* ${service}\n` : '') +
                   `\n_A new enquiry has been submitted via the contact page. Please follow up._`;
    
    return await exports.sendWhatsAppMessage(adminMobile, adminMsg, name);
};

/**
 * Send contact confirmation to User (Dynamic Template)
 */
exports.sendContactUserWhatsApp = async (contactData) => {
    const { name, phone, service, message } = contactData;
    
    const template = await MessageTemplate.findOne({ formType: 'contact' });
    let userMsg = `Hello *${name}*,\n\nThank you for reaching out to *Design House*! 🏛️ We have received your enquiry and our design expert will contact you within *24 business hours*.\n\nBest Regards,\n*Design House Team*`;

    if (template) {
        userMsg = replacePlaceholders(template.whatsappBody, { 
            name, 
            phone, 
            service: service || 'General Enquiry',
            message: message || ''
        });
    }

    return await exports.sendWhatsAppMessage(phone, userMsg, name);
};
