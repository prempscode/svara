const nodemailer = require("nodemailer");

// create transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// generate OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP email
const sendOTPEmail = async (email, otp) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Svara - Email Verification OTP",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <h2 style="color: #8a8a8a;">🎵 Svara</h2>
        <h3>Email Verification</h3>
        <p>Your OTP for email verification is:</p>
        <div style="background: #f5f5f5; padding: 15px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; border-radius: 5px;">
          ${otp}
        </div>
        <p style="color: #666; margin-top: 20px;">This OTP is valid for 10 minutes.</p>
        <p style="color: #999; font-size: 12px;">If you didn't request this, please ignore this email.</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
  return otp;
};

module.exports = { generateOTP, sendOTPEmail };
