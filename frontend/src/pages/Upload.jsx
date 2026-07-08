// src/pages/Upload.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Upload as UploadIcon, Music, Image, X } from "lucide-react";
import api from "../api/axios";
import Navbar from "../components/Navbar";

export default function Upload() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ title: "", description: "" });
  const [audioFile, setAudioFile] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [audioPreview, setAudioPreview] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAudioChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAudioFile(file);
      setAudioPreview(URL.createObjectURL(file));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!audioFile) {
      setError("Please select an audio file");
      setLoading(false);
      return;
    }

    const data = new FormData();
    data.append("title", formData.title);
    data.append("description", formData.description);
    data.append("audio", audioFile);
    if (imageFile) data.append("image", imageFile);

    try {
      await api.post("/music/upload", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      navigate("/home");
    } catch (error) {
      setError(error.response?.data?.message || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      <div className="pt-24 px-6 max-w-2xl mx-auto pb-32">
        <h1 className="text-3xl font-bold text-white mb-8">Upload Track</h1>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="text-white/60 text-sm font-medium block mb-2">
              Track Title
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full bg-white/5 text-white placeholder:text-white/30 px-5 py-4 rounded-xl outline-none focus:ring-1 focus:ring-red-500/50 transition"
              required
            />
          </div>

          <div>
            <label className="text-white/60 text-sm font-medium block mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
              className="w-full bg-white/5 text-white placeholder:text-white/30 px-5 py-4 rounded-xl outline-none focus:ring-1 focus:ring-red-500/50 transition resize-none"
            />
          </div>

          {/* Audio Upload */}
          <div>
            <label className="text-white/60 text-sm font-medium block mb-2">
              Audio File
            </label>
            <div className="bg-white/5 rounded-xl p-6 border-2 border-dashed border-white/10 hover:border-red-500/30 transition">
              {!audioPreview ? (
                <label className="flex flex-col items-center justify-center cursor-pointer">
                  <Music className="w-12 h-12 text-white/20 mb-3" />
                  <span className="text-white/40 text-sm">
                    Click to upload audio
                  </span>
                  <input
                    type="file"
                    accept="audio/*"
                    onChange={handleAudioChange}
                    className="hidden"
                  />
                </label>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Music className="w-6 h-6 text-red-500" />
                    <span className="text-white text-sm">
                      {audioFile?.name}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setAudioFile(null);
                      setAudioPreview(null);
                    }}
                    className="text-white/30 hover:text-red-500 transition"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Image Upload */}
          <div>
            <label className="text-white/60 text-sm font-medium block mb-2">
              Cover Image
            </label>
            <div className="bg-white/5 rounded-xl p-6 border-2 border-dashed border-white/10 hover:border-red-500/30 transition">
              {!imagePreview ? (
                <label className="flex flex-col items-center justify-center cursor-pointer">
                  <Image className="w-12 h-12 text-white/20 mb-3" />
                  <span className="text-white/40 text-sm">
                    Click to upload image
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              ) : (
                <div className="flex items-center gap-4">
                  <img
                    src={imagePreview}
                    alt="Cover"
                    className="w-20 h-20 object-cover rounded-xl"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setImageFile(null);
                      setImagePreview(null);
                    }}
                    className="text-white/30 hover:text-red-500 transition"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-4 rounded-xl transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <UploadIcon className="w-5 h-5" />
            {loading ? "Uploading..." : "Upload Track"}
          </button>
        </form>
      </div>
    </div>
  );
}
