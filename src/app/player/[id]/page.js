"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import useSongStore from "@/lib/songStore";
import {
  FaPlay,
  FaPause,
  FaVolumeUp,
  FaStepBackward,
  FaStepForward,
} from "react-icons/fa";
import Image from "next/image";

export default function PlayerPage() {
  const { id } = useParams();
  const router = useRouter();

  const {
    songs,
    currentSong,
    setCurrentSong,
    playNext,
    playPrevious,
  } = useSongStore();

  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(1);
  const [theme, setTheme] = useState({
    vibrant: "#e91e63",
    muted: "#222",
    darkMuted: "#111",
    lightMuted: "#ccc",
  });

  const [meta, setMeta] = useState({
    title: "Loading title...",
    artist: "Loading artist...",
    album: "Loading album...",
    cover: "/loading.jpg",
    url: "",
  });

  // Rehydrate on refresh
  useEffect(() => {
    const rehydrate = async () => {
      if (!currentSong && id) {
        const res = await fetch(`/api/meta/${id}`);
        const data = await res.json();

        const fallbackSong = {
          id,
          title: data.title || "Unknown Title",
          artist: data.artist || "Unknown Artist",
          album: data.album || "Unknown Album",
          cover: data.cover ? `/api/cover/${id}` : "/default.png",
          url: `/api/song?id=${id}`,
          theme: data.theme,
        };

        setCurrentSong(fallbackSong);
      }
    };
    rehydrate();
  }, [id, currentSong]);

  // Load theme and meta
  useEffect(() => {
    if (!currentSong) return;

    setMeta(currentSong);
    if (currentSong.theme) {
      setTheme({
        vibrant: currentSong.theme.vibrant || "#e91e63",
        muted: currentSong.theme.muted || "#222",
        darkMuted: currentSong.theme.darkMuted || "#111",
        lightMuted: currentSong.theme.lightMuted || "#ccc",
      });
    }

    setPlaying(true);

    // Sync URL
    if (currentSong.id && currentSong.id !== id) {
      router.replace(`/player/${currentSong.id}`);
    }
  }, [currentSong, id, router]);

  // Player control functions
  const togglePlay = () => {
    if (!audioRef.current) return;
    playing ? audioRef.current.pause() : audioRef.current.play();
    setPlaying(!playing);
  };

  const handleTimeUpdate = () => {
    setCurrentTime(audioRef.current.currentTime);
  };

  const handleLoadedMetadata = () => {
    setDuration(audioRef.current.duration);
  };

  const handleSeek = (e) => {
    const time = parseFloat(e.target.value);
    audioRef.current.currentTime = time;
    setCurrentTime(time);
  };

  const handleVolumeChange = (e) => {
    const vol = parseFloat(e.target.value);
    setVolume(vol);
    audioRef.current.volume = vol;
  };

  const formatTime = (t) =>
    isNaN(t) ? "0:00" : `${Math.floor(t / 60)}:${("0" + Math.floor(t % 60)).slice(-2)}`;

  // 🌈 Background Styles
  const backgroundGradient = `linear-gradient(to bottom, ${theme.darkMuted} 0%, ${theme.muted} 100%)`;

  return (
    <div
      className="min-h-screen w-full relative overflow-hidden flex items-center justify-center"
      style={{ background: backgroundGradient }}
    >
      {/* Soft blur cover image in background */}
      <div
        className="absolute inset-0 bg-cover bg-center blur-3xl opacity-20 scale-110"
        style={{ backgroundImage: `url(${meta.cover})` }}
      />

      {/* Black overlay for clarity */}
      <div className="absolute inset-0 bg-black/60 z-0" />

      {/* Content container */}
      <div className="z-10 relative w-full max-w-xl mx-auto text-white p-6 flex flex-col items-center">
        {/* Cover */}
        <div className="w-64 h-64 rounded-2xl overflow-hidden shadow-xl mb-4">
          <Image
            src={meta.cover}
            alt={meta.title}
            height={400}
            width={400}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Title & Info */}
        <h1 className="text-2xl font-bold text-center">{meta.title}</h1>
        <p className="text-pink-300">{meta.artist}</p>
        <p className="text-pink-400 italic">{meta.album}</p>

        {/* Audio Element */}
        {meta.url && (
          <audio
            ref={audioRef}
            src={meta.url}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onEnded={() => {
              setPlaying(false);
              playNext();
            }}
            autoPlay
          />
        )}

        {/* Seekbar */}
        <div className="mt-6 w-full">
          <input
            type="range"
            min={0}
            max={duration}
            value={currentTime}
            onChange={handleSeek}
            className="w-full"
            style={{ accentColor: theme.vibrant }}
          />
          <div className="flex justify-between text-sm text-pink-300 mt-1">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex justify-center items-center gap-6 mt-6 text-2xl text-pink-300">
          <button onClick={playPrevious}>
            <FaStepBackward />
          </button>
          <button
            onClick={togglePlay}
            className="text-white p-4 rounded-full shadow-lg transition"
            style={{ backgroundColor: theme.vibrant }}
          >
            {playing ? <FaPause /> : <FaPlay />}
          </button>
          <button onClick={playNext}>
            <FaStepForward />
          </button>
        </div>

        {/* Volume */}
        <div className="flex items-center gap-2 mt-6 w-full">
          <FaVolumeUp className="text-pink-300" />
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={volume}
            onChange={handleVolumeChange}
            className="w-full"
            style={{ accentColor: theme.vibrant }}
          />
        </div>
      </div>
    </div>
  );
}
