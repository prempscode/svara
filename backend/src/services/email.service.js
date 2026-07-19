const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const sendOTPEmail = async (email, otp) => {
  console.log(`[email] attempting to send OTP to ${email} via Resend`);

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: "Svara <onboarding@resend.dev>",
      to: [email],
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
    }),
  });

  if (!response.ok) {
    const errBody = await response.text();
    throw new Error(`Resend API ${response.status}: ${errBody}`);
  }

  const data = await response.json();
  console.log(`[email] SUCCESS — sent to ${email}, id: ${data.id}`);
  return otp;
};

module.exports = { generateOTP, sendOTPEmail };
