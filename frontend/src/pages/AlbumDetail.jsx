import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import Navbar from "../components/Navbar";

export default function AlbumDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [album, setAlbum] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const fetchAlbum = async () => {
    try {
      const response = await api.get(`/music/albums/${id}`);
      setAlbum(response.data.album);
    } catch (error) {
      console.error("Error fetching album:", error);
      if (error.response?.status === 404) {
        navigate("/albums");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchAlbum();
      setLoading(false);
    };
    loadData();
  }, [id]);

  const handleDeleteAlbum = async () => {
    try {
      await api.delete(`/music/albums/${id}`);
      navigate("/albums");
    } catch (error) {
      alert(error.response?.data?.message || "Delete failed");
    }
  };

  const handleLike = async (trackId) => {
    try {
      await api.post(`/music/${trackId}/like`);
      fetchAlbum(); // Refresh to update likes
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

  if (!album) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Album not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      <div className="pt-20 px-6 max-w-4xl mx-auto pb-24">
        {/* Album Header */}
        <div className="flex items-center gap-6 mb-8">
          <img
            src={album.image || "https://picsum.photos/300"}
            alt={album.title}
            className="w-48 h-48 object-cover rounded-lg shadow-2xl"
          />
          <div className="flex-1">
            <h1 className="text-4xl font-bold text-white">{album.title}</h1>
            <p className="text-gray-400 text-lg">
              by {album.artist?.username}
            </p>
            <p className="text-gray-500 mt-2">{album.description}</p>
            <p className="text-gray-500 text-sm mt-2">
              {album.musics?.length || 0} tracks
            </p>
            <div className="flex gap-3 mt-4">
              <Link
                to={`/edit-album/${album._id}`}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition"
              >
                Edit Album
              </Link>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm transition"
              >
                Delete Album
              </button>
            </div>
          </div>
        </div>

        {/* Tracks List */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-4">Tracks</h2>
          {album.musics?.length === 0 ? (
            <p className="text-gray-400">No tracks in this album yet</p>
          ) : (
            <div className="space-y-3">
              {album.musics.map((track, index) => (
                <div
                  key={track._id}
                  className="bg-gray-900 hover:bg-gray-800 p-4 rounded-lg flex items-center gap-4"
                >
                  <span className="text-gray-500 w-8">{index + 1}</span>
                  <img
                    src={track.image || "https://picsum.photos/50"}
                    alt={track.title}
                    className="w-12 h-12 rounded object-cover"
                  />
                  <div className="flex-1">
                    <h3 className="text-white font-semibold">{track.title}</h3>
                    <p className="text-gray-400 text-sm">
                      {track.artist?.username}
                    </p>
                  </div>
                  <button
                    onClick={() => handleLike(track._id)}
                    className="text-2xl hover:scale-110 transition"
                  >
                    {track.likes?.includes(album.artist?._id) ? "❤️" : "🤍"}
                  </button>
                  <p className="text-gray-500 text-sm">
                    ❤️ {track.likes?.length || 0}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
            <div className="bg-gray-900 p-6 rounded-xl max-w-md w-full">
              <h3 className="text-xl font-bold text-white mb-4">Delete Album?</h3>
              <p className="text-gray-400 mb-6">
                Are you sure you want to delete "{album.title}"? This action cannot be undone.
              </p>
              <div className="flex gap-4">
                <button
                  onClick={handleDeleteAlbum}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg transition"
                >
                  Delete
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 rounded-lg transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}