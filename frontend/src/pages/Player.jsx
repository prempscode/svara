// src/pages/Player.jsx
import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Heart,
  Share2,
  MoreHorizontal,
  Volume2,
  VolumeX,
  Repeat,
  Shuffle,
  Music2,
  ArrowLeft,
} from "lucide-react";
import api from "../api/axios";
import Navbar from "../components/Navbar";

export default function Player() {
  const { id } = useParams();
  const navigate = useNavigate();
  const audioRef = useRef(null);

  const [track, setTrack] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [error, setError] = useState("");

  // Fetch track details
  useEffect(() => {
    const fetchTrack = async () => {
      try {
        const response = await api.get(`/music/track/${id}`);
        setTrack(response.data.music);
        setLikesCount(response.data.music.likes?.length || 0);
        // Check if user liked this track
        const user = JSON.parse(localStorage.getItem("user"));
        if (user && response.data.music.likes?.includes(user.id)) {
          setIsLiked(true);
        }
      } catch (error) {
        console.error("Error fetching track:", error);
        setError("Track not found");
      } finally {
        setLoading(false);
      }
    };
    fetchTrack();
  }, [id]);

  // Audio controls
  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      setDuration(audioRef.current.duration);
    }
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    if (audioRef.current) {
      if (isMuted) {
        audioRef.current.volume = volume || 0.8;
        setIsMuted(false);
      } else {
        audioRef.current.volume = 0;
        setIsMuted(true);
      }
    }
  };

  const handleSeek = (e) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
  };

  const formatTime = (seconds) => {
    if (isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleLike = async () => {
    try {
      await api.post(`/music/${id}/like`);
      setIsLiked(!isLiked);
      setLikesCount(isLiked ? likesCount - 1 : likesCount + 1);
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

  if (error || !track) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white/60 text-center">
          <Music2 className="w-16 h-16 mx-auto mb-4 text-white/20" />
          <p className="text-xl">{error || "Track not found"}</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 text-red-500 hover:text-red-400 transition"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <Navbar />

      {/* Audio Element */}
      <audio
        ref={audioRef}
        src={track.uri}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleTimeUpdate}
        onEnded={() => setIsPlaying(false)}
      />

      <main className="pt-24 px-6 pb-32 max-w-4xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-white/40 hover:text-white transition mb-8"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>

        {/* Player Content */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Album Art */}
          <div className="aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-red-500/20 to-purple-500/20">
            <img
              src={
                track.image ||
                "https://picsum.photos/seed/" + track._id + "/600/600"
              }
              alt={track.title}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Track Info */}
          <div className="flex flex-col justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                {track.title}
              </h1>
              <Link to={`/user/${track.artist?._id}`}>
                <p className="text-xl text-white/60 hover:text-white transition">
                  {track.artist?.username}
                </p>
              </Link>
              {track.description && (
                <p className="text-white/40 mt-4 text-sm leading-relaxed">
                  {track.description}
                </p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-6 mt-6">
              {/* <button className="text-white/40 hover:text-white transition">
                
              </button> */}
              <button className="text-white/40 hover:text-white transition">
                <MoreHorizontal className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Player Controls */}
        <div className="mt-12 bg-white/5 rounded-2xl p-6 backdrop-blur-xl">
          {/* Progress Bar */}
          <div className="flex items-center gap-4">
            <span className="text-white/40 text-sm min-w-[40px]">
              {formatTime(currentTime)}
            </span>
            <input
              type="range"
              min="0"
              max={duration || 100}
              value={currentTime}
              onChange={handleSeek}
              className="flex-1 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer
                [&::-webkit-slider-thumb]:appearance-none
                [&::-webkit-slider-thumb]:w-4
                [&::-webkit-slider-thumb]:h-4
                [&::-webkit-slider-thumb]:rounded-full
                [&::-webkit-slider-thumb]:bg-red-500
                [&::-webkit-slider-thumb]:cursor-pointer"
            />
            <span className="text-white/40 text-sm min-w-[40px]">
              {formatTime(duration)}
            </span>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-8 mt-6">
            <button className="text-white/40 hover:text-white transition">
              <Shuffle className="w-5 h-5" />
            </button>
            <button className="text-white/40 hover:text-white transition">
              <SkipBack className="w-6 h-6" />
            </button>
            <button
              onClick={togglePlay}
              className="w-14 h-14 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center transition hover:scale-105 shadow-lg shadow-red-500/30"
            >
              {isPlaying ? (
                <Pause className="w-6 h-6 text-white fill-white" />
              ) : (
                <Play className="w-6 h-6 text-white fill-white ml-1" />
              )}
            </button>
            <button className="text-white/40 hover:text-white transition">
              <SkipForward className="w-6 h-6" />
            </button>
            <button className="text-white/40 hover:text-white transition">
              <Repeat className="w-5 h-5" />
            </button>
          </div>

          {/* Volume Control */}
          <div className="flex items-center justify-end gap-3 mt-6">
            <button
              onClick={toggleMute}
              className="text-white/40 hover:text-white transition"
            >
              {isMuted ? (
                <VolumeX className="w-5 h-5" />
              ) : (
                <Volume2 className="w-5 h-5" />
              )}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              className="w-24 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer
                [&::-webkit-slider-thumb]:appearance-none
                [&::-webkit-slider-thumb]:w-3
                [&::-webkit-slider-thumb]:h-3
                [&::-webkit-slider-thumb]:rounded-full
                [&::-webkit-slider-thumb]:bg-red-500"
            />
          </div>
        </div>

        {/* Related/Suggested Tracks */}
        <div className="mt-12">
          <h3 className="text-white font-semibold mb-4">
            More from {track.artist?.username}
          </h3>
          <div className="text-white/40 text-sm">
            {/* You can fetch more tracks by same artist here */}
            <p className="text-white/30">More tracks coming soon...</p>
          </div>
        </div>
      </main>
    </div>
  );
}
