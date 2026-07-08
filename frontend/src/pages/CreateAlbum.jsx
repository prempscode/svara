import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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

  // Fetch user's tracks
  useEffect(() => {
    const fetchTracks = async () => {
      try {
        const response = await api.get("/music/user/me");
        setTracks(response.data.musics);
      } catch (error) {
        console.error("Error fetching tracks:", error);
      }
    };
    fetchTracks();
  }, []);

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
    setLoading(true);
    setError("");

    if (!formData.title) {
      setError("Album title is required");
      setLoading(false);
      return;
    }

    const data = new FormData();
    data.append("title", formData.title);
    data.append("description", formData.description);
    data.append("musics", JSON.stringify(selectedTracks));
    if (imageFile) {
      data.append("image", imageFile);
    }

    try {
      await api.post("/music/album", data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      navigate("/albums");
    } catch (error) {
      setError(error.response?.data?.message || "Create album failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      <div className="pt-20 px-6 max-w-2xl mx-auto pb-24">
        <h1 className="text-3xl font-bold text-white mb-6">📀 Create Album</h1>

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

          {/* Cover Image */}
          <div>
            <label className="text-gray-300 block mb-2">Album Cover (Optional)</label>
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
                    alt="Cover preview"
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
              {tracks.length === 0 ? (
                <p className="text-gray-400">You haven't uploaded any tracks yet</p>
              ) : (
                tracks.map((track) => (
                  <div
                    key={track._id}
                    className="flex items-center gap-3 p-2 hover:bg-gray-700 rounded cursor-pointer"
                    onClick={() => handleTrackToggle(track._id)}
                  >
                    <input
                      type="checkbox"
                      checked={selectedTracks.includes(track._id)}
                      onChange={() => {}}
                      className="w-5 h-5 accent-red-600"
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

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create Album 🚀"}
          </button>
        </form>
      </div>
    </div>
  );
}