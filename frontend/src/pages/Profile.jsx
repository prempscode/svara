import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import Navbar from "../components/Navbar";

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [username, setUsername] = useState("");

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
          localStorage.removeItem("token");
          navigate("/");
        } catch (error) {
          alert(error.response?.data?.message || "Delete failed");
        }
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
      <div className="pt-20 px-6 max-w-4xl mx-auto pb-24">
        {/* Profile Header */}
        <div className="flex items-center gap-6 mb-8">
          <div className="w-32 h-32 rounded-full bg-gray-700 overflow-hidden">
            {user?.profileImage ? (
              <img
                src={user.profileImage}
                alt={user.username}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-4xl text-white bg-gradient-to-br from-red-600 to-black">
                {user?.username?.[0]?.toUpperCase()}
              </div>
            )}
          </div>
          <div className="flex-1">
            {editMode ? (
              <form onSubmit={handleUpdateProfile} className="flex gap-2">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="bg-gray-800 text-white px-4 py-2 rounded-lg outline-none focus:ring-2 focus:ring-red-500"
                />
                <button
                  type="submit"
                  className="bg-red-600 text-white px-4 py-2 rounded-lg"
                >
                  Save
                </button>
                <button
                  onClick={() => setEditMode(false)}
                  className="bg-gray-600 text-white px-4 py-2 rounded-lg"
                >
                  Cancel
                </button>
              </form>
            ) : (
              <>
                <h1 className="text-3xl font-bold text-white">
                  {user?.username}
                </h1>
                <p className="text-gray-400">{user?.email}</p>
                <p className="text-gray-500 text-sm mt-1">Role: {user?.role}</p>
                <button
                  onClick={() => setEditMode(true)}
                  className="text-red-500 hover:underline mt-2"
                >
                  Edit Profile
                </button>
              </>
            )}
          </div>
          <button
            onClick={handleDeleteAccount}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm transition"
          >
            Delete Account
          </button>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-white mb-4">
            My Tracks ({tracks.length})
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {tracks.map((track) => (
              <div key={track._id} className="bg-gray-900 p-3 rounded-lg">
                <img
                  src={track.image || "https://picsum.photos/200"}
                  alt={track.title}
                  className="w-full aspect-square object-cover rounded-lg mb-2"
                />
                <h4 className="text-white font-semibold truncate">
                  {track.title}
                </h4>
                <p className="text-gray-400 text-sm">
                  ❤️ {track.likes?.length || 0}
                </p>
                <Link
                  to={`/edit-track/${track._id}`}
                  className="absolute top-2 right-2 bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded text-xs transition opacity-0 group-hover:opacity-100"
                >
                  Edit
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
