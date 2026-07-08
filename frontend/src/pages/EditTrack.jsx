import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import Navbar from "../components/Navbar";

export default function EditTrack() {
  const { id } = useParams(); // Get track ID from URL
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

  // Fetch track data when page loads
  useEffect(() => {
    const fetchTrack = async () => {
      try {
        const response = await api.get(`/music/${id}`);
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
          navigate("/home");
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
      console.log("Update success:", response.data);
      navigate("/profile"); // Go back to profile
    } catch (error) {
      setError(error.response?.data?.message || "Update failed");
      console.error("Update error:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this track?")) {
      try {
        await api.delete(`/music/${id}`);
        navigate("/profile");
      } catch (error) {
        alert(error.response?.data?.message || "Delete failed");
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      <div className="pt-20 px-6 max-w-2xl mx-auto pb-24">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-white">✏️ Edit Track</h1>
          <button
            onClick={handleDelete}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm transition"
          >
            Delete Track
          </button>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-500 px-4 py-2 rounded-lg mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label className="text-gray-300 block mb-2">Track Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full bg-gray-800 text-white px-4 py-3 rounded-lg outline-none focus:ring-2 focus:ring-red-500"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-gray-300 block mb-2">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
              className="w-full bg-gray-800 text-white px-4 py-3 rounded-lg outline-none focus:ring-2 focus:ring-red-500 resize-none"
            />
          </div>

          {/* Current Image Preview */}
          {currentImage && !imageFile && (
            <div>
              <label className="text-gray-300 block mb-2">Current Cover</label>
              <img
                src={currentImage}
                alt="Current cover"
                className="w-32 h-32 object-cover rounded-lg"
              />
            </div>
          )}

          {/* Image File */}
          <div>
            <label className="text-gray-300 block mb-2">New Cover Image (Optional)</label>
            <div className="bg-gray-800 rounded-lg p-4">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-red-600 file:text-white hover:file:bg-red-700"
              />
              {imagePreview && (
                <div className="mt-3">
                  <img
                    src={imagePreview}
                    alt="New cover preview"
                    className="w-32 h-32 object-cover rounded-lg"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Audio File */}
          <div>
            <label className="text-gray-300 block mb-2">New Audio File (Optional)</label>
            <div className="bg-gray-800 rounded-lg p-4">
              <input
                type="file"
                accept="audio/*"
                onChange={handleAudioChange}
                className="text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-red-600 file:text-white hover:file:bg-red-700"
              />
              {audioPreview && (
                <div className="mt-3">
                  <audio controls className="w-full">
                    <source src={audioPreview} />
                  </audio>
                </div>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50"
            >
              {submitting ? "Updating..." : "Update Track"}
            </button>
            <button
              type="button"
              onClick={() => navigate("/profile")}
              className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-lg transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}