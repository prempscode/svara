import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import Navbar from "../components/Navbar";

export default function Albums() {
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAlbums = async () => {
    try {
      const response = await api.get("/music/albums");
      setAlbums(response.data.albums);
    } catch (error) {
      console.error("Error fetching albums:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchAlbums();
      setLoading(false);
    };
    loadData();
  }, []);

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
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-white">📀 Albums</h1>
          <Link
            to="/create-album"
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition"
          >
            + Create Album
          </Link>
        </div>

        {albums.length === 0 ? (
          <div className="text-center text-gray-400 py-12">
            <p className="text-6xl mb-4">📀</p>
            <p className="text-xl">No albums yet</p>
            <p className="text-sm">Create your first album!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {albums.map((album) => (
              <Link key={album._id} to={`/album/${album._id}`}>
                <div className="bg-gray-900 p-4 rounded-lg hover:bg-gray-800 transition group">
                  <div className="relative">
                    <img
                      src={album.image || "https://picsum.photos/300"}
                      alt={album.title}
                      className="w-full aspect-square object-cover rounded-lg mb-3"
                    />
                  </div>
                  <h3 className="text-white font-semibold truncate">{album.title}</h3>
                  <p className="text-gray-400 text-sm">{album.artist?.username}</p>
                  <p className="text-gray-500 text-xs mt-1">
                    {album.musics?.length || 0} tracks
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}