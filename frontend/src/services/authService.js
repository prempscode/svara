import api from "../api/axios";

export async function registerUser(formData) {
  const response = await api.post("/auth/register", formData);
  return response;
}
