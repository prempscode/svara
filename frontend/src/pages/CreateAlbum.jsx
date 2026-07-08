// src/pages/CreateAlbum.jsx
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import Navbar from "../components/Navbar";

export default function CreateAlbum() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [tracks, setTracks] = useState([]);
  const [selectedTracks, setSelectedTracks] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [error, setError] = useState("");
  const [fetchingTracks, setFetchingTracks] = useState(true);

  // ✅ Fetch current user and their tracks
  useEffect(() => {
    const fetchUserAndTracks = async () => {
      try {
        setFetchingTracks(true);

        // ✅ Get current user from backend (using cookie)
        const userResponse = await api.get("/auth/profile");
        const user = userResponse.data.user;
        console.log("👤 Current user:", user);

        // ✅ Fetch tracks by this user
        const tracksResponse = await api.get(`/music/user/${user._id}`);
        console.log("🎵 User tracks:", tracksResponse.data);
        setTracks(tracksResponse.data.musics || []);
      } catch (error) {
        console.error("❌ Error fetching data:", error);
        setError("Failed to load your tracks. Please login again.");
        if (error.response?.status === 401) {
          navigate("/login");
        }
      } finally {
        setFetchingTracks(false);
      }
    };

    fetchUserAndTracks();
  }, [navigate]);

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
        : [...prev, trackId],
    );
  };

  // src/pages/CreateAlbum.jsx - Handle Submit

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!formData.title) {
      setError("Album title is required");
      setLoading(false);
      return;
    }

    if (selectedTracks.length === 0) {
      setError("Please select at least one track");
      setLoading(false);
      return;
    }

    const data = new FormData();
    data.append("title", formData.title);
    data.append("description", formData.description);
    data.append("musics", JSON.stringify(selectedTracks)); // ✅ Send as JSON string
    if (imageFile) {
      data.append("image", imageFile);
    }

    try {
      const response = await api.post("/music/album", data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      console.log("✅ Album created:", response.data);
      navigate("/albums");
    } catch (error) {
      console.error("❌ Error:", error);
      setError(error.response?.data?.message || "Create album failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      <div className="pt-24 px-6 max-w-2xl mx-auto pb-32">
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate("/albums")}
            className="text-white/40 hover:text-white transition"
          >
            ← Back
          </button>
          <h1 className="text-3xl font-bold text-white">📀 Create Album</h1>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label className="text-white/60 text-sm font-medium block mb-2">
              Album Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter album title"
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
              placeholder="Add a description (optional)"
              rows="3"
              className="w-full bg-white/5 text-white placeholder:text-white/30 px-5 py-4 rounded-xl outline-none focus:ring-1 focus:ring-red-500/50 transition resize-none"
            />
          </div>

          {/* Cover Image */}
          <div>
            <label className="text-white/60 text-sm font-medium block mb-2">
              Album Cover
            </label>
            <div className="bg-white/5 rounded-xl p-6 border-2 border-dashed border-white/10 hover:border-red-500/30 transition">
              {!imagePreview ? (
                <label className="flex flex-col items-center justify-center cursor-pointer">
                  <span className="text-white/40 text-sm">
                    Click to upload cover image
                  </span>
                  <span className="text-white/20 text-xs mt-1">
                    JPG, PNG, WebP
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
                    alt="Cover preview"
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
                    Remove
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Select Tracks */}
          <div>
            <label className="text-white/60 text-sm font-medium block mb-2">
              Select Tracks ({selectedTracks.length} selected)
            </label>
            <div className="bg-white/5 rounded-xl p-4 max-h-60 overflow-y-auto">
              {fetchingTracks ? (
                <div className="text-white/40 text-center py-8">
                  Loading your tracks...
                </div>
              ) : tracks.length === 0 ? (
                <div className="text-white/40 text-center py-8">
                  <p>You haven't uploaded any tracks yet.</p>
                  <Link
                    to="/upload"
                    className="text-red-500 hover:underline block mt-2"
                  >
                    Upload a track first →
                  </Link>
                </div>
              ) : (
                tracks.map((track) => (
                  <div
                    key={track._id}
                    className="flex items-center gap-3 p-3 hover:bg-white/5 rounded-xl cursor-pointer transition"
                    onClick={() => handleTrackToggle(track._id)}
                  >
                    <input
                      type="checkbox"
                      checked={selectedTracks.includes(track._id)}
                      onChange={() => {}}
                      className="w-5 h-5 accent-red-500"
                    />
                    <img
                      src={track.image || "https://picsum.photos/40"}
                      alt={track.title}
                      className="w-10 h-10 rounded object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-white truncate">{track.title}</p>
                      <p className="text-white/40 text-sm">
                        ❤️ {track.likes?.length || 0}
                      </p>
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
              disabled={loading || tracks.length === 0}
              className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-4 rounded-xl transition disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create Album"}
            </button>
            <button
              type="button"
              onClick={() => navigate("/albums")}
              className="px-6 bg-white/5 hover:bg-white/10 text-white font-semibold py-4 rounded-xl transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
