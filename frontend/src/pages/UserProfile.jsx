import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import api from "../api/axios";
import Navbar from "../components/Navbar";

export default function UserProfile() {
  const { userId } = useParams();
  const [user, setUser] = useState(null);
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUserProfile = async () => {
    try {
      const userResponse = await api.get(`/auth/profile/${userId}`);
      setUser(userResponse.data.user);

      const tracksResponse = await api.get(`/music/user/${userId}`);
      setTracks(tracksResponse.data.musics);
    } catch (error) {
      console.error("Error fetching user profile:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchUserProfile();
      setLoading(false);
    };
    loadData();
  }, [userId]);

  const handleLike = async (trackId) => {
    try {
      await api.post(`/music/${trackId}/like`);
      fetchUserProfile(); // Refresh to update likes
    } catch (error) {
      console.error("Error liking track:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">User not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      <div className="pt-20 px-6 max-w-4xl mx-auto pb-24">
        {/* User Header */}
        <div className="flex items-center gap-6 mb-8">
          <div className="w-32 h-32 rounded-full bg-gray-700 overflow-hidden">
            {user.profileImage ? (
              <img
                src={user.profileImage}
                alt={user.username}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-4xl text-white bg-gradient-to-br from-red-600 to-blue-600">
                {user.username?.[0]?.toUpperCase()}
              </div>
            )}
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">{user.username}</h1>
            <p className="text-gray-400">📀 {tracks.length} tracks</p>
          </div>
        </div>

        {/* User's Tracks */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-4">🎵 All Tracks</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {tracks.map((track) => (
              <div key={track._id} className="bg-gray-900 p-3 rounded-lg group">
                <div className="relative">
                  <img
                    src={track.image || "https://picsum.photos/200"}
                    alt={track.title}
                    className="w-full aspect-square object-cover rounded-lg mb-2"
                  />
                  <button
                    onClick={() => handleLike(track._id)}
                    className="absolute bottom-2 right-2 bg-red-600 p-2 rounded-full opacity-0 group-hover:opacity-100 transition"
                  >
                    ❤️
                  </button>
                </div>
                <h4 className="text-white font-semibold truncate">{track.title}</h4>
                <p className="text-gray-400 text-sm">❤️ {track.likes?.length || 0}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}