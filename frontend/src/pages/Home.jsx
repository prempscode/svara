// src/pages/Home.jsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Heart, Play, Music2 } from "lucide-react";
import api from "../api/axios";
import Navbar from "../components/Navbar";

export default function Home() {
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTracks = async () => {
    try {
      const response = await api.get('/music');
      setTracks(response.data.musics);
    } catch (error) {
      console.error("Error fetching tracks:", error);
    } finally {
      setLoading(false);
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
        <Music2 className="w-8 h-8 text-white/40 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <Navbar />

      <main className="pt-24 px-6 pb-32 max-w-7xl mx-auto">
        {/* Hero */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
            Browse
          </h1>
          <p className="text-white/40 mt-2">
            Discover music shared by the community
          </p>
        </div>

        {/* Track Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
          {tracks.map((track) => (
            <div key={track._id} className="group cursor-pointer">
              <div className="relative aspect-square rounded-xl overflow-hidden bg-white/5">
                <img
                  src={
                    track.image ||
                    "https://picsum.photos/seed/" + track._id + "/300/300"
                  }
                  alt={track.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />
                {/* Overlay */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleLike(track._id);
                    }}
                    className="w-12 h-12 rounded-full bg-red-500 flex items-center justify-center shadow-xl hover:scale-110 transition"
                  >
                    <Heart className="w-5 h-5 text-white fill-white" />
                  </button>
                </div>
                {/* Play Icon */}
                <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition">
                  <div className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center shadow-lg">
                    <Play className="w-4 h-4 text-white fill-white ml-0.5" />
                  </div>
                </div>
              </div>

              <div className="mt-3">
                <h3 className="text-white font-medium text-sm truncate">
                  {track.title}
                </h3>
                <Link to={`/user/${track.artist?._id}`}>
                  <p className="text-white/40 text-sm hover:text-white/70 transition truncate">
                    {track.artist?.username}
                  </p>
                </Link>
                <p className="text-white/30 text-xs mt-1">
                  ❤️ {track.likes?.length || 0}
                </p>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
