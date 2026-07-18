import api from "../api/axios";

export async function getProfile() {
  const response = await api.get("/auth/profile");
  return response.data;
}

export async function updateProfile(formData) {
  const response = await api.patch("/auth/profile", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
}

export async function getUserProfile(userId) {
  const response = await api.get(`/auth/profile/${userId}`);
  return response.data;
}
