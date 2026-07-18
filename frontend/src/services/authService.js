import api from "../api/axios";

export async function registerUser(formData) {
  const response = await api.post("/auth/register", formData);

  return response;
}

export async function verifyOTP(userId, otp) {
  const response = await api.post("/auth/verify-otp", {
    userId,
    otp,
  });

  return response;
}

export async function resendOTP(email) {
  await api.post("/auth/resend-otp", {
    email,
  });
}
