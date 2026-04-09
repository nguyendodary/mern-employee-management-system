const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

/**
 * Send an email
 * @param {string} to - recipient email
 * @param {string} subject
 * @param {string} html
 */
const sendMail = async (to, subject, html) => {
  try {
    const info = await transporter.sendMail({
      from: process.env.MAIL_FROM || 'noreply@ems.com',
      to,
      subject,
      html,
    });
    console.log(`Email sent: ${info.messageId}`);
    return info;
  } catch (err) {
    console.error(`Email error: ${err.message}`);
    // Non-fatal — log and continue
  }
};

module.exports = sendMail;
