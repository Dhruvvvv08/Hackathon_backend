const nodemailer = require('nodemailer');

/**
 * Create a reusable SMTP transporter using Gmail.
 * Falls back gracefully if SMTP is not configured.
 */
let transporter = null;

const getTransporter = () => {
  if (transporter) return transporter;

  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn('⚠️  SMTP credentials not configured. Email sending is disabled.');
    return null;
  }

  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT, 10) || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  return transporter;
};

/**
 * Send a booking confirmation email.
 *
 * @param {object} params
 * @param {string} params.to - Recipient email
 * @param {string} params.userName - Recipient name
 * @param {string} params.venueName - Venue name
 * @param {string} params.sport - Sport type
 * @param {string} params.date - Booking date (YYYY-MM-DD)
 * @param {string} params.startTime - Slot start time
 * @param {string} params.endTime - Slot end time
 */
const sendBookingConfirmation = async ({ to, userName, venueName, sport, date, startTime, endTime }) => {
  const transport = getTransporter();
  if (!transport) return;

  try {
    await transport.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to,
      subject: `✅ Booking Confirmed — ${venueName} on ${date}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
          <h2 style="color: #2e7d32;">Booking Confirmed! 🎉</h2>
          <p>Hi <strong>${userName}</strong>,</p>
          <p>Your slot has been successfully booked. Here are the details:</p>
          <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
            <tr><td style="padding: 8px; font-weight: bold;">Venue</td><td style="padding: 8px;">${venueName}</td></tr>
            <tr style="background: #f5f5f5;"><td style="padding: 8px; font-weight: bold;">Sport</td><td style="padding: 8px;">${sport}</td></tr>
            <tr><td style="padding: 8px; font-weight: bold;">Date</td><td style="padding: 8px;">${date}</td></tr>
            <tr style="background: #f5f5f5;"><td style="padding: 8px; font-weight: bold;">Time</td><td style="padding: 8px;">${startTime} – ${endTime}</td></tr>
          </table>
          <p style="color: #757575; font-size: 13px;">If you need to cancel, use the cancellation API.</p>
        </div>
      `,
    });
    console.log(`📧 Booking confirmation email sent to ${to}`);
  } catch (error) {
    console.error(`❌ Failed to send booking email: ${error.message}`);
    // Don't throw — email failure should not break the booking flow
  }
};

/**
 * Send a booking cancellation email.
 *
 * @param {object} params
 * @param {string} params.to - Recipient email
 * @param {string} params.userName - Recipient name
 * @param {string} params.venueName - Venue name
 * @param {string} params.sport - Sport type
 * @param {string} params.date - Booking date (YYYY-MM-DD)
 * @param {string} params.startTime - Slot start time
 * @param {string} params.endTime - Slot end time
 */
const sendCancellationEmail = async ({ to, userName, venueName, sport, date, startTime, endTime }) => {
  const transport = getTransporter();
  if (!transport) return;

  try {
    await transport.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to,
      subject: `❌ Booking Cancelled — ${venueName} on ${date}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
          <h2 style="color: #c62828;">Booking Cancelled</h2>
          <p>Hi <strong>${userName}</strong>,</p>
          <p>Your booking has been cancelled. Here were the details:</p>
          <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
            <tr><td style="padding: 8px; font-weight: bold;">Venue</td><td style="padding: 8px;">${venueName}</td></tr>
            <tr style="background: #f5f5f5;"><td style="padding: 8px; font-weight: bold;">Sport</td><td style="padding: 8px;">${sport}</td></tr>
            <tr><td style="padding: 8px; font-weight: bold;">Date</td><td style="padding: 8px;">${date}</td></tr>
            <tr style="background: #f5f5f5;"><td style="padding: 8px; font-weight: bold;">Time</td><td style="padding: 8px;">${startTime} – ${endTime}</td></tr>
          </table>
          <p style="color: #757575; font-size: 13px;">You can rebook the same slot if it's still available.</p>
        </div>
      `,
    });
    console.log(`📧 Cancellation email sent to ${to}`);
  } catch (error) {
    console.error(`❌ Failed to send cancellation email: ${error.message}`);
  }
};

module.exports = {
  sendBookingConfirmation,
  sendCancellationEmail,
};
