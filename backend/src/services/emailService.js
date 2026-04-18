const nodemailer = require("nodemailer");

let transporter;

const createTransporter = () => {
  if (!process.env.MAIL_HOST || !process.env.MAIL_USER || !process.env.MAIL_PASS) {
    return null;
  }

  return nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: Number(process.env.MAIL_PORT || 587),
    secure: false,
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
  });
};

const sendEmail = async ({ to, subject, text }) => {
  if (!transporter) {
    transporter = createTransporter();
  }

  if (!transporter) {
    // Fallback for local development when SMTP is not configured.
    console.log("EMAIL MOCK:", { to, subject, text });
    return;
  }

  await transporter.sendMail({
    from: process.env.MAIL_FROM || process.env.MAIL_USER,
    to,
    subject,
    text,
  });
};

module.exports = { sendEmail };
