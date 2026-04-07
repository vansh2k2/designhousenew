const nodemailer = require('nodemailer');
const EmailLog = require('../models/EmailLog.model');
const MessageTemplate = require('../models/MessageTemplate.model');

// Configure SMTP transport
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_PORT == 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// =============================================================
//  PREMIUM SHELL: Wraps any body HTML in Design House styling
//  title    – bold white header text
//  subtitle – light gold subtitle
//  body     – inner HTML content
// =============================================================
const premiumShell = (title, subtitle, body) => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <title>${title} ${subtitle}</title>
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet"/>
  <style>
    @media only screen and (max-width:620px){
      .email-container { width:100% !important; border-radius:0 !important; }
      .email-header    { padding:28px 20px 24px !important; }
      .email-body      { padding:24px 20px 20px !important; }
      .email-footer    { padding:14px 20px    !important; }
      .header-title    { font-size:22px !important; }
      .header-subtitle { font-size:18px !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background-color:#ffffff;font-family:'Poppins','Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0"
         style="background-color:#ffffff;padding:0;border-collapse:collapse;">
    <tr><td align="center" style="padding:0;">

      <table class="email-container" cellpadding="0" cellspacing="0"
             style="width:100%;max-width:650px;border-collapse:collapse;
                    box-shadow:0 4px 24px rgba(0,31,61,0.10);">

        <!-- Gold top bar -->
        <tr><td style="height:5px;background:linear-gradient(90deg,#7a5510,#c9972b,#f0c84a,#c9972b,#7a5510);font-size:0;line-height:0;">&nbsp;</td></tr>

        <!-- Dark navy header -->
        <tr>
          <td class="email-header"
              style="background-color:#001F3D;padding:40px 44px 36px;text-align:center;">
            <p style="margin:0 0 10px;font-family:'Poppins',sans-serif;font-size:9px;font-weight:600;
                       letter-spacing:7px;text-transform:uppercase;color:#c9972b;">Design House</p>
            <h1 class="header-title"
                style="margin:0 0 5px;font-family:'Poppins',sans-serif;font-size:26px;font-weight:700;
                        color:#ffffff;letter-spacing:-0.5px;line-height:1.25;">${title}</h1>
            <p class="header-subtitle"
               style="margin:0;font-family:'Poppins',sans-serif;font-size:20px;font-weight:300;
                       color:#c9972b;letter-spacing:-0.3px;line-height:1.3;">${subtitle}</p>
          </td>
        </tr>

        <!-- White content area -->
        <tr>
          <td class="email-body"
              style="background-color:#ffffff;padding:32px 44px 28px;
                     font-family:'Poppins',sans-serif;font-size:14px;color:#333333;line-height:1.8;">
            ${body}
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td class="email-footer"
              style="background-color:#001F3D;padding:18px 44px;text-align:center;">
            <p style="margin:0;font-family:'Poppins',sans-serif;font-size:10px;
                       color:#7a9bbf;letter-spacing:0.5px;line-height:1.6;">
              &copy; ${new Date().getFullYear()} Design House India Pvt. Ltd.&nbsp;&nbsp;|&nbsp;&nbsp;All Rights Reserved
            </p>
          </td>
        </tr>

        <!-- Gold bottom bar -->
        <tr><td style="height:5px;background:linear-gradient(90deg,#7a5510,#c9972b,#f0c84a,#c9972b,#7a5510);font-size:0;line-height:0;">&nbsp;</td></tr>
      </table>

    </td></tr>
  </table>
</body>
</html>`;

// =============================================================
//  HELPER: Replace [[PLACEHOLDER]] tokens
// =============================================================
const replacePlaceholders = (template, data) => {
  if (!template) return '';
  let content = template;
  Object.keys(data).forEach((key) => {
    const value = data[key] || '';
    const regex = new RegExp(`\\[\\[${key.toUpperCase()}\\]\\]`, 'g');
    content = content.replace(regex, value);
  });
  return content;
};

// Helper: build a data row for admin notification tables
const row = (label, value) =>
  value
    ? `<tr>
        <td style="padding:9px 0;border-bottom:1px solid #f0ece4;vertical-align:top;width:120px;">
          <span style="font-family:'Poppins',sans-serif;font-size:10px;font-weight:700;
                        letter-spacing:2px;text-transform:uppercase;color:#8b7355;">${label}</span>
        </td>
        <td style="padding:9px 0 9px 16px;border-bottom:1px solid #f0ece4;vertical-align:top;">
          <span style="font-family:'Poppins',sans-serif;font-size:14px;color:#1a2940;">${value}</span>
        </td>
      </tr>`
    : '';

// =============================================================
//  HELPER: Save email log
// =============================================================
const saveEmailLog = async ({ name, recipient, phone, subject, message, status, error }) => {
  try {
    await EmailLog.create({ name, recipient, phone, subject, message, status, error: error || null });
  } catch (logErr) {
    console.error('❌ Failed to save email log:', logErr.message);
  }
};


/* ════════════════════════════════════════════════════════════
   1.  ADMIN ▸ BOOKING NOTIFICATION
   ════════════════════════════════════════════════════════════ */
exports.sendBookingEmail = async (bookingData) => {
  try {
    const { name, email, phone, company, message } = bookingData;

    const body = `
      <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin-bottom:20px;">
        ${row('Name', name)}
        ${row('Email', email)}
        ${row('Phone', phone)}
        ${row('Company', company || '—')}
      </table>
      <div style="background:#f9f7f3;border-left:4px solid #c9972b;padding:16px 20px;border-radius:0 8px 8px 0;">
        <p style="margin:0 0 6px;font-size:10px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#8b7355;">Message</p>
        <p style="margin:0;font-size:14px;line-height:1.7;color:#1a2940;">${message}</p>
      </div>`;

    const html = premiumShell('New Consultation', 'Request', body);
    const mailOptions = {
      from: `"${process.env.FROM_NAME || 'Design House'}" <${process.env.FROM_EMAIL || process.env.SMTP_USER}>`,
      to: process.env.ADMIN_EMAIL || process.env.SMTP_TO || process.env.SMTP_USER,
      subject: `New Consultation Request — ${name}`,
      html,
    };

    await transporter.sendMail(mailOptions);
    await saveEmailLog({ name, recipient: mailOptions.to, phone, subject: mailOptions.subject, message, status: 'success' });
    return { success: true };
  } catch (error) {
    console.error('❌ sendBookingEmail:', error.message);
    await saveEmailLog({ name: bookingData.name, recipient: 'admin', subject: 'New Consultation Request', status: 'failed', error: error.message });
    return { success: false, error: error.message };
  }
};


/* ════════════════════════════════════════════════════════════
   2.  USER ▸ BOOKING CONFIRMATION  (always premium shell)
   ════════════════════════════════════════════════════════════ */
exports.sendConfirmationEmail = async (bookingData) => {
  try {
    const { name, email, message } = bookingData;

    // Fetch DB template for the BODY CONTENT
    const template = await MessageTemplate.findOne({ formType: 'booking' });

    let subject = `We've Received Your Request — Design House`;
    let bodyContent;

    if (template && template.emailBody && template.emailBody.trim().length > 20) {
      // Use DB body (admin-edited content) — replace placeholders, then wrap in shell
      subject = replacePlaceholders(template.emailSubject || subject, { name, email, message });
      bodyContent = replacePlaceholders(template.emailBody, { name, email, message });
    } else {
      // Premium fallback body
      bodyContent = `
        <p style="font-size:16px;color:#1a2940;margin:0 0 16px;">Dear <strong>${name}</strong>,</p>
        <p style="color:#444;line-height:1.8;margin:0 0 20px;">
          Thank you for reaching out to <strong>Design House</strong>. We have successfully received
          your consultation request and our team is reviewing it.
        </p>
        <div style="background:#f9f7f3;border-left:4px solid #c9972b;padding:16px 20px;border-radius:0 8px 8px 0;margin-bottom:20px;">
          <p style="margin:0 0 6px;font-size:10px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#8b7355;">Your Message</p>
          <p style="margin:0;font-size:14px;color:#1a2940;line-height:1.7;">${message}</p>
        </div>
        <p style="color:#444;line-height:1.8;margin:0 0 20px;">
          One of our design specialists will contact you within <strong>24 business hours</strong>.
        </p>
        <p style="color:#444;margin:20px 0 0;">
          Warm Regards,<br/><strong style="color:#001F3D;">The Design House Team</strong>
        </p>`;
    }

    const html = premiumShell('Request', 'Received', bodyContent);

    const mailOptions = {
      from: `"${process.env.FROM_NAME || 'Design House'}" <${process.env.FROM_EMAIL || process.env.SMTP_USER}>`,
      to: email,
      subject,
      html,
    };

    await transporter.sendMail(mailOptions);
    await saveEmailLog({ name, recipient: email, subject, message, status: 'success' });
    return { success: true };
  } catch (error) {
    console.error('❌ sendConfirmationEmail:', error.message);
    await saveEmailLog({ name: bookingData.name, recipient: bookingData.email, subject: 'Booking Confirmation', status: 'failed', error: error.message });
    return { success: false, error: error.message };
  }
};


/* ════════════════════════════════════════════════════════════
   3.  ADMIN ▸ CAREER NOTIFICATION
   ════════════════════════════════════════════════════════════ */
exports.sendCareerBookingEmail = async (applicationData) => {
  try {
    const { name, email, phone, subject: position, message } = applicationData;

    const body = `
      <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin-bottom:20px;">
        ${row('Name', name)}
        ${row('Email', email)}
        ${row('Phone', phone)}
        ${row('Position', position || '—')}
      </table>
      <div style="background:#f9f7f3;border-left:4px solid #c9972b;padding:16px 20px;border-radius:0 8px 8px 0;">
        <p style="margin:0 0 6px;font-size:10px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#8b7355;">Cover Note</p>
        <p style="margin:0;font-size:14px;line-height:1.7;color:#1a2940;">${message || '—'}</p>
      </div>`;

    const html = premiumShell('New Career', 'Application', body);
    const mailOptions = {
      from: `"${process.env.FROM_NAME || 'Design House'}" <${process.env.FROM_EMAIL || process.env.SMTP_USER}>`,
      to: process.env.CAREER_ADMIN_EMAIL || 'vanshchaudhary2k2@gmail.com',
      subject: `New Career Application — ${name}`,
      html,
    };

    await transporter.sendMail(mailOptions);
    await saveEmailLog({ name, recipient: mailOptions.to, phone, subject: mailOptions.subject, message, status: 'success' });
    return { success: true };
  } catch (error) {
    console.error('❌ sendCareerBookingEmail:', error.message);
    return { success: false, error: error.message };
  }
};


/* ════════════════════════════════════════════════════════════
   4.  USER ▸ CAREER CONFIRMATION  (always premium shell)
   ════════════════════════════════════════════════════════════ */
exports.sendCareerConfirmationEmail = async (applicationData) => {
  try {
    const { name, email } = applicationData;
    const position = applicationData.subject || 'the applied position';

    const template = await MessageTemplate.findOne({ formType: 'career' });

    let subject = `Application Received — Design House`;
    let bodyContent;

    if (template && template.emailBody && template.emailBody.trim().length > 20) {
      subject = replacePlaceholders(template.emailSubject || subject, { name, email, subject: position });
      bodyContent = replacePlaceholders(template.emailBody, { name, email, subject: position });
    } else {
      bodyContent = `
        <p style="font-size:16px;color:#1a2940;margin:0 0 16px;">Dear <strong>${name}</strong>,</p>
        <p style="color:#444;line-height:1.8;margin:0 0 20px;">
          Thank you for applying to <strong>Design House India</strong>. We have successfully received
          your application for the profile: <strong>${position}</strong>.
        </p>
        <div style="background:#f9f7f3;border-left:4px solid #c9972b;padding:16px 20px;border-radius:0 8px 8px 0;margin-bottom:20px;">
          <p style="margin:0;font-size:14px;line-height:1.7;color:#1a2940;">
            Our talent acquisition team is currently reviewing your profile and portfolio.
            If your skills align with our requirements, we will reach out within
            <strong>3–5 business days</strong>.
          </p>
        </div>
        <p style="color:#444;margin:20px 0 0;">
          Best Regards,<br/><strong style="color:#001F3D;">Talent Team, Design House</strong>
        </p>`;
    }

    const html = premiumShell('Application', 'Received', bodyContent);

    const mailOptions = {
      from: `"${process.env.FROM_NAME || 'Design House'}" <${process.env.FROM_EMAIL || process.env.SMTP_USER}>`,
      to: email,
      subject,
      html,
    };

    await transporter.sendMail(mailOptions);
    await saveEmailLog({ name, recipient: email, subject, status: 'success' });
    return { success: true };
  } catch (error) {
    console.error('❌ sendCareerConfirmationEmail:', error.message);
    await saveEmailLog({ name: applicationData.name, recipient: applicationData.email, subject: 'Career Application Confirmation', status: 'failed', error: error.message });
    return { success: false, error: error.message };
  }
};


/* ════════════════════════════════════════════════════════════
   5.  ADMIN ▸ CONTACT NOTIFICATION
   ════════════════════════════════════════════════════════════ */
exports.sendContactAdminEmail = async (contactData) => {
  try {
    const { name, email, phone, service, message } = contactData;

    const body = `
      <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin-bottom:20px;">
        ${row('Name', name)}
        ${row('Email', email)}
        ${row('Phone', phone)}
        ${row('Service', service || 'General Enquiry')}
      </table>
      <div style="background:#f9f7f3;border-left:4px solid #c9972b;padding:16px 20px;border-radius:0 8px 8px 0;">
        <p style="margin:0 0 6px;font-size:10px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#8b7355;">Message</p>
        <p style="margin:0;font-size:14px;line-height:1.7;color:#1a2940;">${message}</p>
      </div>`;

    const html = premiumShell('New Customer', 'Enquiry', body);
    const mailOptions = {
      from: `"${process.env.FROM_NAME || 'Design House'}" <${process.env.FROM_EMAIL || process.env.SMTP_USER}>`,
      to: process.env.CONTACT_ADMIN_EMAIL || 'virender.1974vc@gmail.com',
      subject: `New Customer Enquiry — ${name}`,
      html,
    };

    await transporter.sendMail(mailOptions);
    await saveEmailLog({ name, recipient: mailOptions.to, phone, subject: mailOptions.subject, message, status: 'success' });
    return { success: true };
  } catch (error) {
    console.error('❌ sendContactAdminEmail:', error.message);
    return { success: false, error: error.message };
  }
};


/* ════════════════════════════════════════════════════════════
   6.  USER ▸ CONTACT CONFIRMATION  (always premium shell)
   ════════════════════════════════════════════════════════════ */
exports.sendContactUserConfirmationEmail = async (contactData) => {
  try {
    const { name, email } = contactData;
    const service = contactData.service || 'General Enquiry';
    const message = contactData.message || '';

    const template = await MessageTemplate.findOne({ formType: 'contact' });

    let subject = `Thank You for Reaching Out — Design House`;
    let bodyContent;

    if (template && template.emailBody && template.emailBody.trim().length > 20) {
      subject = replacePlaceholders(template.emailSubject || subject, { name, email, service, message });
      bodyContent = replacePlaceholders(template.emailBody, { name, email, service, message });
    } else {
      bodyContent = `
        <p style="font-size:16px;color:#1a2940;margin:0 0 16px;">Dear <strong>${name}</strong>,</p>
        <p style="color:#444;line-height:1.8;margin:0 0 20px;">
          Thank you for contacting <strong>Design House</strong>. We have received your enquiry
          regarding <strong>${service}</strong>.
        </p>
        <div style="background:#f9f7f3;border-left:4px solid #c9972b;padding:16px 20px;border-radius:0 8px 8px 0;margin-bottom:20px;">
          <p style="margin:0;font-size:14px;line-height:1.7;color:#1a2940;">
            Our design experts are reviewing your requirement and will be in touch with you shortly
            (usually within <strong>24 business hours</strong>).
          </p>
        </div>
        <p style="color:#444;margin:20px 0 0;">
          Warm Regards,<br/><strong style="color:#001F3D;">Design House Team</strong>
        </p>`;
    }

    const html = premiumShell('Thank You for', 'Reaching Out', bodyContent);

    const mailOptions = {
      from: `"${process.env.FROM_NAME || 'Design House'}" <${process.env.FROM_EMAIL || process.env.SMTP_USER}>`,
      to: email,
      subject,
      html,
    };

    await transporter.sendMail(mailOptions);
    await saveEmailLog({ name, recipient: email, subject, status: 'success' });
    return { success: true };
  } catch (error) {
    console.error('❌ sendContactUserConfirmationEmail:', error.message);
    await saveEmailLog({ name: contactData.name, recipient: contactData.email, subject: 'Contact Confirmation', status: 'failed', error: error.message });
    return { success: false, error: error.message };
  }
};
