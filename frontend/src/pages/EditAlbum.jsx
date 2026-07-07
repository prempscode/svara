import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import Navbar from "../components/Navbar";

export default function EditAlbum() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [userTracks, setUserTracks] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
  });
  const [selectedTracks, setSelectedTracks] = useState([]);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [currentImage, setCurrentImage] = useState(null);

  useEffect(() => {
    const fetchAlbum = async () => {
      try {
        const response = await api.get(`/music/albums/${id}`);
        const album = response.data.album;
        setFormData({
          title: album.title,
          description: album.description || "",
        });
        setSelectedTracks(album.musics.map((track) => track._id));
        setCurrentImage(album.image);
      } catch (error) {
        console.error("Error fetching album:", error);
        setError("Album not found");
        navigate("/albums");
      } finally {
        setLoading(false);
      }
    };

    const fetchTracks = async () => {
      try {
        const response = await api.get("/music/user/me");
        setUserTracks(response.data.musics);
      } catch (error) {
        console.error("Error fetching tracks:", error);
      }
    };

    fetchAlbum();
    fetchTracks();
  }, [id, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleTrackToggle = (trackId) => {
    setSelectedTracks((prev) =>
      prev.includes(trackId)
        ? prev.filter((id) => id !== trackId)
        : [...prev, trackId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    const data = new FormData();
    data.append("title", formData.title);
    data.append("description", formData.description);
    data.append("musics", JSON.stringify(selectedTracks));
    if (imageFile) {
      data.append("image", imageFile);
    }

    try {
      await api.patch(`/music/albums/${id}`, data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      navigate(`/album/${id}`);
    } catch (error) {
      setError(error.response?.data?.message || "Update failed");
    } finally {
      setSubmitting(false);
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
        <h1 className="text-3xl font-bold text-white mb-6">✏️ Edit Album</h1>

        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-500 px-4 py-2 rounded-lg mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label className="text-gray-300 block mb-2">Album Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full bg-gray-800 text-white px-4 py-3 rounded-lg outline-none focus:ring-2 focus:ring-green-500"
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
              className="w-full bg-gray-800 text-white px-4 py-3 rounded-lg outline-none focus:ring-2 focus:ring-green-500 resize-none"
            />
          </div>

          {/* Current Image */}
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

          {/* New Image */}
          <div>
            <label className="text-gray-300 block mb-2">New Cover (Optional)</label>
            <div className="bg-gray-800 rounded-lg p-4">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-600 file:text-white hover:file:bg-green-700"
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

          {/* Select Tracks */}
          <div>
            <label className="text-gray-300 block mb-2">
              Select Tracks ({selectedTracks.length} selected)
            </label>
            <div className="bg-gray-800 rounded-lg p-4 max-h-60 overflow-y-auto">
              {userTracks.length === 0 ? (
                <p className="text-gray-400">You haven't uploaded any tracks yet</p>
              ) : (
                userTracks.map((track) => (
                  <div
                    key={track._id}
                    className="flex items-center gap-3 p-2 hover:bg-gray-700 rounded cursor-pointer"
                    onClick={() => handleTrackToggle(track._id)}
                  >
                    <input
                      type="checkbox"
                      checked={selectedTracks.includes(track._id)}
                      onChange={() => {}}
                      className="w-5 h-5 accent-green-600"
                    />
                    <img
                      src={track.image || "https://picsum.photos/40"}
                      alt={track.title}
                      className="w-10 h-10 rounded object-cover"
                    />
                    <div className="flex-1">
                      <p className="text-white">{track.title}</p>
                      <p className="text-gray-400 text-sm">❤️ {track.likes?.length || 0}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50"
            >
              {submitting ? "Updating..." : "Update Album"}
            </button>
            <button
              type="button"
              onClick={() => navigate(`/album/${id}`)}
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