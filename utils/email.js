// utils/email.js
import nodemailer from "nodemailer";
import fs from "fs";
import path, { dirname, join } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Generate a secure OTP with better randomness
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Centralized error handling for email sending
const sendEmail = async (email, subject, templatePath, replacements) => {
  try {
    // Resolve the full path to the template
    const fullTemplatePath = path.join(__dirname, templatePath);

    // Read the template file
    let htmlTemplate = fs.readFileSync(fullTemplatePath, "utf8");

    // Replace placeholders
    Object.keys(replacements).forEach((key) => {
      htmlTemplate = htmlTemplate.replace(`{{${key}}}`, replacements[key]);
    });

    // Email configuration
    const mailOptions = {
      from: `APL Shoes Secondbrand <${process.env.EMAIL_USER}>`,
      to: email,
      subject: subject,
      html: htmlTemplate,
    };

    // Send email
    await transporter.sendMail(mailOptions);
    console.log(`Email sent successfully to ${email}`);
  } catch (error) {
    console.error(`Error sending email to ${email}:`, error);
    throw error;
  }
};

// Specific email sending functions
const sendOtp = async (email, otp) => {
  try {
    await sendEmail(email, "Verifikasi OTP", "email.html", { OTP: otp });
  } catch (error) {
    console.error("Error saat mengirimkan OTP:", error);
    throw error;
  }
};

const sendResetPasswordEmail = async (email, otp) => {
  try {
    await sendEmail(email, "Reset Password", "reset-password-email.html", {
      OTP: otp,
    });
  } catch (error) {
    console.error("Error saat mengirimkan reset password OTP:", error);
    throw error;
  }
};

export { transporter, generateOTP, sendOtp, sendResetPasswordEmail };
