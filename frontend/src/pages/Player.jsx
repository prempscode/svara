/* eslint-disable no-unused-vars */
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
  const [isRepeat, setIsRepeat] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [playlist, setPlaylist] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // ✅ Fetch track details
  const fetchTrack = async () => {
    try {
      const response = await api.get(`/music/track/${id}`);
      const trackData = response.data.music;
      setTrack(trackData);
      setLikesCount(trackData.likes?.length || 0);

      // Check if user liked this track
      const user = JSON.parse(localStorage.getItem("user"));
      if (user && trackData.likes?.includes(user.id)) {
        setIsLiked(true);
      }
    } catch (error) {
      console.error("Error fetching track:", error);
      setError("Track not found");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Fetch playlist (all tracks for shuffle/next/prev)
  const fetchPlaylist = async () => {
    try {
      const response = await api.get("/music");
      setPlaylist(response.data.musics);
      const index = response.data.musics.findIndex((t) => t._id === id);
      setCurrentIndex(index !== -1 ? index : 0);
    } catch (error) {
      console.error("Error fetching playlist:", error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchTrack();
      await fetchPlaylist();
      setLoading(false);
    };
    loadData();
  }, [id]);

  // ✅ Play/Pause
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

  // ✅ Handle time update
  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      setDuration(audioRef.current.duration);
    }
  };

  // ✅ Handle volume change
  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
    setIsMuted(newVolume === 0);
  };

  // ✅ Toggle mute
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

  // ✅ Seek to position
  const handleSeek = (e) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
  };

  // ✅ Format time
  const formatTime = (seconds) => {
    if (isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // ✅ Handle like/unlike
  const handleLike = async () => {
    try {
      const response = await api.post(`/music/${id}/like`);
      setIsLiked(response.data.isLiked);
      setLikesCount(response.data.likes);
    } catch (error) {
      console.error("Error liking track:", error);
    }
  };

  // ✅ Play next track
  const playNext = () => {
    if (playlist.length === 0) return;

    let nextIndex;
    if (isShuffle) {
      // Random shuffle
      do {
        nextIndex = Math.floor(Math.random() * playlist.length);
      } while (nextIndex === currentIndex && playlist.length > 1);
    } else {
      // Sequential
      nextIndex = (currentIndex + 1) % playlist.length;
    }

    const nextTrack = playlist[nextIndex];
    if (nextTrack) {
      navigate(`/player/${nextTrack._id}`);
    }
  };

  // ✅ Play previous track
  const playPrevious = () => {
    if (playlist.length === 0) return;

    const prevIndex = (currentIndex - 1 + playlist.length) % playlist.length;
    const prevTrack = playlist[prevIndex];
    if (prevTrack) {
      navigate(`/player/${prevTrack._id}`);
    }
  };

  // ✅ Handle track end
  const handleTrackEnd = () => {
    if (isRepeat) {
      // Repeat current track
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play();
      }
    } else {
      // Play next
      playNext();
    }
  };

  // ✅ Toggle repeat
  const toggleRepeat = () => {
    setIsRepeat(!isRepeat);
  };

  // ✅ Toggle shuffle
  const toggleShuffle = () => {
    setIsShuffle(!isShuffle);
  };

  // ✅ Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === "INPUT") return; // Ignore if typing in input

      switch (e.code) {
        case "Space":
          e.preventDefault();
          togglePlay();
          break;
        case "ArrowRight":
          if (e.shiftKey) playNext();
          break;
        case "ArrowLeft":
          if (e.shiftKey) playPrevious();
          break;
        case "KeyM":
          toggleMute();
          break;
        default:
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isPlaying, isRepeat, isShuffle, currentIndex, playlist]);

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
        onEnded={handleTrackEnd}
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
          <div className="aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-red-500/20 to-purple-500/20 shadow-2xl shadow-red-500/10">
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
              {/* <button
                onClick={handleLike}
                className="flex items-center gap-2 transition hover:scale-110"
              >
                <Heart
                  className={`w-8 h-8 transition ${
                    isLiked
                      ? "text-red-500 fill-red-500"
                      : "text-white/40 hover:text-white"
                  }`}
                />
                <span className="text-white/40 text-sm">{likesCount}</span>
              </button> */}
              {/* <button className="text-white/40 hover:text-white transition">
                <Share2 className="w-6 h-6" />
              </button>
              <button className="text-white/40 hover:text-white transition">
                <MoreHorizontal className="w-6 h-6" />
              </button> */}
            </div>
          </div>
        </div>

        {/* Player Controls */}
        <div className="mt-12 bg-white/5 rounded-2xl p-6 backdrop-blur-xl border border-white/5">
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
                [&::-webkit-slider-thumb]:shadow-lg
                [&::-webkit-slider-thumb]:shadow-red-500/30
                [&::-webkit-slider-thumb]:cursor-pointer
                [&::-moz-range-thumb]:w-4
                [&::-moz-range-thumb]:h-4
                [&::-moz-range-thumb]:rounded-full
                [&::-moz-range-thumb]:bg-red-500
                [&::-moz-range-thumb]:border-0"
            />
            <span className="text-white/40 text-sm min-w-[40px]">
              {formatTime(duration)}
            </span>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-8 mt-6">
            {/* Shuffle Button */}
            <button
              onClick={toggleShuffle}
              className={`transition ${
                isShuffle ? "text-red-500" : "text-white/40 hover:text-white"
              }`}
              title="Shuffle"
            >
              <Shuffle className="w-5 h-5" />
            </button>

            {/* Previous Button */}
            <button
              onClick={playPrevious}
              className="text-white/40 hover:text-white transition"
              title="Previous"
            >
              <SkipBack className="w-6 h-6" />
            </button>

            {/* Play/Pause Button */}
            <button
              onClick={togglePlay}
              className="w-14 h-14 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center transition hover:scale-105 shadow-lg shadow-red-500/30"
              title="Play/Pause"
            >
              {isPlaying ? (
                <Pause className="w-6 h-6 text-white fill-white" />
              ) : (
                <Play className="w-6 h-6 text-white fill-white ml-1" />
              )}
            </button>

            {/* Next Button */}
            <button
              onClick={playNext}
              className="text-white/40 hover:text-white transition"
              title="Next"
            >
              <SkipForward className="w-6 h-6" />
            </button>

            {/* Repeat Button */}
            <button
              onClick={toggleRepeat}
              className={`transition ${
                isRepeat ? "text-red-500" : "text-white/40 hover:text-white"
              }`}
              title="Repeat"
            >
              <Repeat className="w-5 h-5" />
            </button>
          </div>

          {/* Volume Control */}
          <div className="flex items-center justify-end gap-3 mt-6">
            <button
              onClick={toggleMute}
              className="text-white/40 hover:text-white transition"
              title={isMuted ? "Unmute" : "Mute"}
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
                [&::-webkit-slider-thumb]:bg-red-500
                [&::-webkit-slider-thumb]:cursor-pointer
                [&::-moz-range-thumb]:w-3
                [&::-moz-range-thumb]:h-3
                [&::-moz-range-thumb]:rounded-full
                [&::-moz-range-thumb]:bg-red-500
                [&::-moz-range-thumb]:border-0"
            />
          </div>
        </div>

        {/* Keyboard Shortcuts Info */}
        <div className="mt-6 text-center text-white/20 text-xs">
          <kbd className="px-2 py-1 bg-white/5 rounded">Space</kbd> Play/Pause
          &nbsp;·&nbsp;
          <kbd className="px-2 py-1 bg-white/5 rounded">Shift + →</kbd> Next
          &nbsp;·&nbsp;
          <kbd className="px-2 py-1 bg-white/5 rounded">Shift + ←</kbd> Previous
          &nbsp;·&nbsp;
          <kbd className="px-2 py-1 bg-white/5 rounded">M</kbd> Mute
        </div>
      </main>
    </div>
  );
}
