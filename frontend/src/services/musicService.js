import api from "../api/axios";

export async function getAllMusic() {
  const response = await api.get("/music");
  return response.data;
}

export async function getMusicById(id) {
  const response = await api.get(`/music/track/${id}`);
  return response.data;
}

export async function toggleLike(id) {
  const response = await api.post(`/music/${id}/like`);
  return response.data;
}

export async function uploadMusic(formData) {
  const response = await api.post("/music/upload", formData);
  return response.data;
}

export async function deleteMusic(id) {
  const response = await api.delete(`/music/${id}`);
  return response.data;
}

export async function updateMusic(id, formData) {
  const response = await api.patch(`/music/${id}`, formData);
  return response.data;
}

export async function getAllAlbums() {
  const response = await api.get("/music/albums");
  return response.data;
}

export async function createAlbum(formData) {
  const response = await api.post("/music/album", formData);
  return response.data;
}

export async function getAlbumById(id) {
  const response = await api.get(`/music/albums/${id}`);
  return response.data;
}

export async function updateAlbum(id, formData) {
  const response = await api.patch(`/music/albums/${id}`, formData);
  return response.data;
}

export async function deleteAlbum(id) {
  const response = await api.delete(`/music/albums/${id}`);
  return response.data;
}

export async function getUserTracks(userId) {
  const response = await api.get(`/music/user/${userId}`);
  return response.data;
}

export async function getLikedTracks() {
  const response = await api.get("/music/liked");
  return response.data;
}

export async function getUserAlbums(userId) {
  const response = await api.get(`/music/albums/user/${userId}`);
  return response.data;
}
