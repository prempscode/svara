// src/pages/Profile.jsx
import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Camera, Edit, Trash2 } from "lucide-react";
import api from "../api/axios";
import Navbar from "../components/Navbar";

export default function Profile() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [user, setUser] = useState(null);
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [username, setUsername] = useState("");
  const [uploading, setUploading] = useState(false);

  const fetchProfile = async () => {
    try {
      const userResponse = await api.get("/auth/profile");
      setUser(userResponse.data.user);
      setUsername(userResponse.data.user.username);

      const tracksResponse = await api.get(
        `/music/user/${userResponse.data.user._id}`,
      );
      setTracks(tracksResponse.data.musics);
    } catch (error) {
      console.error("Error fetching profile:", error);
      if (error.response?.status === 401) {
        navigate("/");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchProfile();
      setLoading(false);
    };
    loadData();
  }, []);

  // Handle profile picture upload
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("image", file);

    try {
      const response = await api.patch("/auth/profile", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      console.log("✅ Profile picture updated:", response.data);
      await fetchProfile();
      alert("Profile picture updated successfully!");
    } catch (error) {
      console.error("❌ Error uploading profile picture:", error);
      alert(
        error.response?.data?.message || "Failed to update profile picture",
      );
    } finally {
      setUploading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      await api.patch("/auth/profile", { username });
      setEditMode(false);
      await fetchProfile();
    } catch (error) {
      alert(error.response?.data?.message || "Update failed");
    }
  };

  const handleDeleteAccount = async () => {
    if (
      window.confirm("Are you sure? This will delete your account permanently!")
    ) {
      const password = prompt("Enter your password to confirm:");
      if (password) {
        try {
          await api.delete("/auth/profile", { data: { password } });
          localStorage.removeItem("isLoggedIn");
          navigate("/");
        } catch (error) {
          alert(error.response?.data?.message || "Delete failed");
        }
      }
    }
  };

  // ✅ Handle track delete from profile
  const handleDeleteTrack = async (trackId, trackTitle) => {
    if (window.confirm(`Are you sure you want to delete "${trackTitle}"?`)) {
      try {
        await api.delete(`/music/${trackId}`);
        await fetchProfile(); // Refresh tracks
        alert("Track deleted successfully!");
      } catch (error) {
        alert(error.response?.data?.message || "Delete failed");
      }
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
      <div className="pt-24 px-6 max-w-4xl mx-auto pb-32">
        {/* Profile Header */}
        <div className="flex items-center gap-6 mb-8">
          {/* Profile Picture with Upload */}
          <div className="relative group">
            <div className="w-32 h-32 rounded-full bg-gray-700 overflow-hidden">
              {user?.profileImage ? (
                <img
                  src={user.profileImage}
                  alt={user.username}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-4xl text-white bg-gradient-to-br from-red-500 to-purple-600">
                  {user?.username?.[0]?.toUpperCase()}
                </div>
              )}
            </div>
            {/* Upload Button Overlay */}
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="absolute bottom-0 right-0 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full shadow-lg transition hover:scale-105 disabled:opacity-50"
            >
              {uploading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Camera className="w-5 h-5" />
              )}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </div>

          <div className="flex-1">
            {editMode ? (
              <form onSubmit={handleUpdateProfile} className="flex gap-2">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="bg-white/5 text-white px-4 py-2 rounded-xl outline-none focus:ring-1 focus:ring-red-500/50"
                />
                <button
                  type="submit"
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl transition"
                >
                  Save
                </button>
                <button
                  onClick={() => setEditMode(false)}
                  className="bg-white/5 hover:bg-white/10 text-white px-4 py-2 rounded-xl transition"
                >
                  Cancel
                </button>
              </form>
            ) : (
              <>
                <h1 className="text-3xl font-bold text-white">
                  {user?.username}
                </h1>
                <p className="text-white/40">{user?.email}</p>
                <p className="text-white/30 text-sm mt-1">Role: {user?.role}</p>
                <button
                  onClick={() => setEditMode(true)}
                  className="text-white/40 hover:text-white transition text-sm mt-2"
                >
                  Edit Profile
                </button>
              </>
            )}
          </div>

          <button
            onClick={handleDeleteAccount}
            className="bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 px-4 py-2 rounded-xl text-sm transition"
          >
            Delete Account
          </button>
        </div>

        {/* ✅ User's Tracks with Edit & Delete Buttons */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-4">
            My Tracks ({tracks.length})
          </h2>

          {tracks.length === 0 ? (
            <div className="text-white/40 text-center py-12">
              <p className="text-4xl mb-4">🎵</p>
              <p>You haven't uploaded any tracks yet.</p>
              <Link
                to="/upload"
                className="text-red-500 hover:underline block mt-2"
              >
                Upload your first track →
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {tracks.map((track) => (
                <div
                  key={track._id}
                  className="bg-white/5 p-3 rounded-xl hover:bg-white/10 transition group relative"
                >
                  {/* Track Image */}
                  <img
                    src={track.image || "https://picsum.photos/200"}
                    alt={track.title}
                    className="w-full aspect-square object-cover rounded-lg mb-2"
                  />

                  {/* Track Info */}
                  <h4 className="text-white font-semibold truncate">
                    {track.title}
                  </h4>
                  <p className="text-white/40 text-sm">
                    ❤️ {track.likes?.length || 0}
                  </p>

                  {/* ✅ Action Buttons - Show on Hover */}
                  <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition">
                    {/* Edit Button */}
                    <Link
                      to={`/edit-track/${track._id}`}
                      className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-lg transition"
                      title="Edit Track"
                    >
                      <Edit className="w-4 h-4" />
                    </Link>

                    {/* Delete Button */}
                    <button
                      onClick={() => handleDeleteTrack(track._id, track.title)}
                      className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg transition"
                      title="Delete Track"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
