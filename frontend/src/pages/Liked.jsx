import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import Navbar from '../components/Navbar';

export default function Liked() {
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ Define fetch function
  const fetchLikedTracks = async () => {
    try {
      const response = await api.get('/music/liked');
      setTracks(response.data.musics);
    } catch (error) {
      console.error('Error fetching liked tracks:', error);
    }
  };

  // ✅ use useEffect to fetch data and set loading
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);  // start loading
      await fetchLikedTracks();
      setLoading(false); // end loading AFTER fetch completes
    };
    
    loadData();
  }, []);

  const handleUnlike = async (trackId) => {
    try {
      await api.post(`/music/${trackId}/like`);
      await fetchLikedTracks(); // refresh after unlike
    } catch (error) {
      console.error('Error unliking track:', error);
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
        <h1 className="text-white text-3xl font-bold mb-6">❤️ Liked Songs</h1>
        {tracks.length === 0 ? (
          <div className="text-center text-gray-400 py-12">
            <p className="text-6xl mb-4">🎵</p>
            <p className="text-xl">No liked songs yet</p>
            <p className="text-sm">Go explore and like some tracks!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {tracks.map((track, index) => (
              <div key={track._id} className="bg-gray-900 hover:bg-gray-800 p-4 rounded-lg flex items-center gap-4">
                <span className="text-gray-500 w-8">{index + 1}</span>
                <img 
                  src={track.image || 'https://picsum.photos/50'} 
                  alt={track.title} 
                  className="w-12 h-12 rounded object-cover" 
                />
                <div className="flex-1">
                  <h3 className="text-white font-semibold">{track.title}</h3>
                  <Link to={`/user/${track.artist?._id}`}>
                    <p className="text-gray-400 text-sm hover:text-green-500">{track.artist?.username}</p>
                  </Link>
                </div>
                <button
                  onClick={() => handleUnlike(track._id)}
                  className="text-green-500 hover:text-green-400 text-2xl"
                >
                  ❤️
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}