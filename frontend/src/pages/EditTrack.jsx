// src/pages/EditTrack.jsx
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Music, Image, X, Trash2 } from "lucide-react";
import api from "../api/axios";
import Navbar from "../components/Navbar";

export default function EditTrack() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
  });
  const [audioFile, setAudioFile] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [audioPreview, setAudioPreview] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [currentImage, setCurrentImage] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Fetch track data
  useEffect(() => {
    const fetchTrack = async () => {
      try {
        const response = await api.get(`/music/track/${id}`);
        const track = response.data.music;
        setFormData({
          title: track.title,
          description: track.description || "",
        });
        setCurrentImage(track.image);
        setAudioPreview(track.uri);
      } catch (error) {
        console.error("Error fetching track:", error);
        setError("Track not found or you don't have permission to edit it");
        if (error.response?.status === 404) {
          navigate("/profile");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchTrack();
  }, [id, navigate]);

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

  // ✅ UPDATE TRACK
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    const data = new FormData();
    data.append("title", formData.title);
    data.append("description", formData.description);
    if (audioFile) {
      data.append("audio", audioFile);
    }
    if (imageFile) {
      data.append("image", imageFile);
    }

    try {
      const response = await api.patch(`/music/${id}`, data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      console.log("✅ Track updated:", response.data);
      navigate("/profile");
    } catch (error) {
      console.error("❌ Update error:", error);
      setError(error.response?.data?.message || "Update failed");
    } finally {
      setSubmitting(false);
    }
  };

  // ✅ DELETE TRACK
  const handleDelete = async () => {
    try {
      await api.delete(`/music/${id}`);
      console.log("✅ Track deleted");
      navigate("/profile");
    } catch (error) {
      console.error("❌ Delete error:", error);
      alert(error.response?.data?.message || "Delete failed");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white/40">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      <div className="pt-24 px-6 max-w-2xl mx-auto pb-32">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/profile")}
              className="text-white/40 hover:text-white transition"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-3xl font-bold text-white">✏️ Edit Track</h1>
          </div>

          {/* ✅ DELETE BUTTON */}
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="flex items-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 px-4 py-2 rounded-xl transition"
          >
            <Trash2 className="w-5 h-5" />
            Delete
          </button>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl mb-6">
            {error}
          </div>
        )}

        {/* ✅ UPDATE FORM */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label className="text-white/60 text-sm font-medium block mb-2">
              Track Title *
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

          {/* Description */}
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

          {/* Current Image */}
          {currentImage && !imageFile && (
            <div>
              <label className="text-white/60 text-sm font-medium block mb-2">
                Current Cover
              </label>
              <img
                src={currentImage}
                alt="Current cover"
                className="w-32 h-32 object-cover rounded-xl"
              />
            </div>
          )}

          {/* New Image */}
          <div>
            <label className="text-white/60 text-sm font-medium block mb-2">
              New Cover Image (Optional)
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
                <div className="flex items-center justify-between">
                  <img
                    src={imagePreview}
                    alt="New cover preview"
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

          {/* Audio */}
          <div>
            <label className="text-white/60 text-sm font-medium block mb-2">
              New Audio File (Optional)
            </label>
            <div className="bg-white/5 rounded-xl p-6 border-2 border-dashed border-white/10 hover:border-red-500/30 transition">
              {!audioFile ? (
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
                    <span className="text-white text-sm">{audioFile.name}</span>
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
            {audioPreview && !audioFile && (
              <div className="mt-3">
                <audio controls className="w-full">
                  <source src={audioPreview} />
                </audio>
              </div>
            )}
          </div>

          {/* ✅ UPDATE BUTTON */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-4 rounded-xl transition disabled:opacity-50"
            >
              {submitting ? "Updating..." : "Update Track"}
            </button>
            <button
              type="button"
              onClick={() => navigate("/profile")}
              className="px-6 bg-white/5 hover:bg-white/10 text-white font-semibold py-4 rounded-xl transition"
            >
              Cancel
            </button>
          </div>
        </form>

        {/* ✅ DELETE CONFIRMATION MODAL */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
            <div className="bg-gray-900 p-6 rounded-xl max-w-md w-full">
              <h3 className="text-xl font-bold text-white mb-2">
                Delete Track?
              </h3>
              <p className="text-white/60 mb-6">
                Are you sure you want to delete "
                <span className="text-white">{formData.title}</span>"?
                <br />
                <span className="text-red-400 text-sm">
                  This action cannot be undone!
                </span>
              </p>
              <div className="flex gap-4">
                <button
                  onClick={handleDelete}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white py-3 rounded-xl transition"
                >
                  Yes, Delete
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 bg-white/5 hover:bg-white/10 text-white py-3 rounded-xl transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
