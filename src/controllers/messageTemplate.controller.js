const MessageTemplate = require('../models/MessageTemplate.model');
const { logActivity } = require('./activityLog.controller');

// ✅ Default BODY-ONLY templates (no premium shell — shell is added by email.service.js)
const DEFAULT_TEMPLATES = [
  {
    formType: 'booking',
    emailSubject: "We've Received Your Request — Design House",
    emailBody: `<p style="font-size:16px;color:#1a2940;margin:0 0 16px;">Dear <strong>[[NAME]]</strong>,</p>
<p style="color:#444;line-height:1.8;margin:0 0 20px;">Thank you for reaching out to <strong>Design House</strong>. We have successfully received your consultation request and our team is reviewing it.</p>
<div style="background:#f9f7f3;border-left:4px solid #c9972b;padding:16px 20px;border-radius:0 8px 8px 0;margin-bottom:20px;">
  <p style="margin:0 0 6px;font-size:10px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#8b7355;">Your Message</p>
  <p style="margin:0;font-size:14px;color:#1a2940;line-height:1.7;">[[MESSAGE]]</p>
</div>
<p style="color:#444;line-height:1.8;margin:0 0 8px;">One of our design specialists will contact you within <strong>24 business hours</strong>.</p>
<p style="color:#444;margin:20px 0 0;">Warm Regards,<br/><strong style="color:#001F3D;">The Design House Team</strong></p>`,
    whatsappBody: "Hello *[[NAME]]*,\n\nThank you for reaching out to *Design House*! 🏛️ We have received your consultation request and our team will contact you within *24 business hours*.\n\nBest Regards,\n*Design House Team*"
  },
  {
    formType: 'career',
    emailSubject: "Application Received — Design House",
    emailBody: `<p style="font-size:16px;color:#1a2940;margin:0 0 16px;">Dear <strong>[[NAME]]</strong>,</p>
<p style="color:#444;line-height:1.8;margin:0 0 20px;">Thank you for applying to <strong>Design House India</strong>. We have successfully received your application for the profile: <strong>[[SUBJECT]]</strong>.</p>
<div style="background:#f9f7f3;border-left:4px solid #c9972b;padding:16px 20px;border-radius:0 8px 8px 0;margin-bottom:20px;">
  <p style="margin:0;font-size:14px;line-height:1.7;color:#1a2940;">Our talent acquisition team is currently reviewing your profile and portfolio. If your skills align with our requirements, we will reach out within <strong>3–5 business days</strong>.</p>
</div>
<p style="color:#444;margin:20px 0 0;">Best Regards,<br/><strong style="color:#001F3D;">Talent Team, Design House</strong></p>`,
    whatsappBody: "Hello *[[NAME]]*,\n\nThank you for applying to *Design House*! 🏛️ We have successfully received your application for *[[SUBJECT]]*. Our talent team will review your profile and contact you if it's a match.\n\nBest Regards,\n*Talent Team, Design House*"
  },
  {
    formType: 'contact',
    emailSubject: "Thank You for Reaching Out — Design House",
    emailBody: `<p style="font-size:16px;color:#1a2940;margin:0 0 16px;">Dear <strong>[[NAME]]</strong>,</p>
<p style="color:#444;line-height:1.8;margin:0 0 20px;">Thank you for contacting <strong>Design House</strong>. We have received your enquiry regarding <strong>[[SERVICE]]</strong>.</p>
<div style="background:#f9f7f3;border-left:4px solid #c9972b;padding:16px 20px;border-radius:0 8px 8px 0;margin-bottom:20px;">
  <p style="margin:0;font-size:14px;line-height:1.7;color:#1a2940;">Our design experts are reviewing your requirement and will be in touch with you shortly (usually within <strong>24 business hours</strong>).</p>
</div>
<p style="color:#444;margin:20px 0 0;">Warm Regards,<br/><strong style="color:#001F3D;">Design House Team</strong></p>`,
    whatsappBody: "Hello *[[NAME]]*,\n\nThank you for reaching out to *Design House*! 🏛️ We have received your enquiry regarding *[[SERVICE]]* and our design expert will contact you within *24 business hours*.\n\nBest Regards,\n*Design House Team*"
  }
];

// ✅ SEED / UPGRADE TEMPLATES IN DB
// Always upgrades if the stored body has old full-HTML shell (>5000 chars) or is very short
exports.seedTemplates = async () => {
  try {
    for (const temp of DEFAULT_TEMPLATES) {
      const existing = await MessageTemplate.findOne({ formType: temp.formType });

      if (!existing) {
        await MessageTemplate.create(temp);
        console.log(`✅ Seeded message template for "${temp.formType}"`);
      } else {
        const bodyLen = (existing.emailBody || '').trim().length;
        // Upgrade if: empty, very short plain text, OR contains full DOCTYPE shell
        const needsUpgrade = bodyLen < 30 || existing.emailBody.includes('<!DOCTYPE html');
        if (needsUpgrade) {
          await MessageTemplate.findOneAndUpdate(
            { formType: temp.formType },
            { emailSubject: temp.emailSubject, emailBody: temp.emailBody, whatsappBody: temp.whatsappBody },
            { new: true }
          );
          console.log(`🔄 Upgraded message template for "${temp.formType}"`);
        } else {
          console.log(`✓ Template for "${temp.formType}" is already a clean body template`);
        }
      }
    }
  } catch (err) {
    console.error('❌ Failed to seed message templates:', err.message);
  }
};

// ✅ GET ALL TEMPLATES
exports.getAllTemplates = async (req, res) => {
  try {
    const templates = await MessageTemplate.find();
    res.status(200).json({ success: true, data: templates });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ UPDATE TEMPLATE
exports.updateTemplate = async (req, res) => {
  try {
    const { formType } = req.params;
    const { emailSubject, emailBody, whatsappBody, updatedBy } = req.body;

    const template = await MessageTemplate.findOneAndUpdate(
      { formType },
      { emailSubject, emailBody, whatsappBody, updatedBy },
      { new: true, upsert: true }
    );

    // ✅ Log activity
    await logActivity(
      updatedBy || 'Admin User',
      'Updated',
      'Message Templates',
      `Updated ${formType === 'booking' ? 'Book A Meeting' : formType === 'career' ? 'Career Application' : 'Contact Enquiry'} response template`
    );

    res.status(200).json({
      success: true,
      message: 'Template updated successfully',
      data: template
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
