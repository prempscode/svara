import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import Navbar from "../components/Navbar";

export default function Home() {
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTracks = async () => {
    try {
      const response = await api.get("/music");
      setTracks(response.data.musics);
    } catch (error) {
      console.error("Error fetching tracks:", error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchTracks();
      setLoading(false);
    };
    loadData();
  }, []);

  const handleLike = async (trackId) => {
    try {
      await api.post(`/music/${trackId}/like`);
      await fetchTracks();
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

  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      <div className="pt-20 px-6 pb-24">
        <h1 className="text-white text-3xl font-bold mb-6">🎵 Public Feed</h1>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {tracks.map((track) => (
            <div
              key={track._id}
              className="bg-gray-900 p-4 rounded-lg hover:bg-gray-800 transition group"
            >
              <div className="relative">
                <img
                  src={track.image || "https://picsum.photos/200"}
                  alt={track.title}
                  className="w-full aspect-square object-cover rounded-lg mb-3"
                />
                <button
                  onClick={() => handleLike(track._id)}
                  className="absolute bottom-2 right-2 bg-green-600 p-2 rounded-full opacity-0 group-hover:opacity-100 transition"
                >
                  ❤️
                </button>
              </div>
              <h3 className="text-white font-semibold truncate">
                {track.title}
              </h3>
              <Link to={`/user/${track.artist?._id}`}>
                <p className="text-gray-400 text-sm hover:text-green-500">
                  {track.artist?.username}
                </p>
              </Link>
              <p className="text-gray-500 text-xs mt-1">
                ❤️ {track.likes?.length || 0} likes
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
