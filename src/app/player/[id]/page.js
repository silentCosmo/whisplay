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

export default function PlayerPage({ onTogglePlaylist }) {
  const { id } = useParams();
  const router = useRouter();
  const { currentSong, setCurrentSong, playNext, playPrevious, repeat } =
    useSongStore();

  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(1);
  const [loading, setLoading] = useState(true);

  const [theme, setTheme] = useState({
    vibrant: "#e91e63",
    muted: "#222",
    darkMuted: "#111",
    lightMuted: "#ccc",
    darkVibrant: "green",
  });

  const [meta, setMeta] = useState({
    title: "Loading…",
    artist: "Loading…",
    album: "",
    cover: "/loading.jpg",
    url: "",
  });

  useEffect(() => {
    if (!currentSong && id) {
      fetch(`/api/meta/${id}`)
        .then((r) => r.json())
        .then((data) =>
          setCurrentSong({
            id,
            title: data.title,
            artist: data.artist,
            album: data.album,
            cover: data.cover ? `/api/cover/${id}` : "/default.png",
            url: `/api/song?id=${id}`,
            theme: data.theme,
          })
        );
    }
  }, [id, currentSong]);

  useEffect(() => {
    if (!currentSong) return;

    setMeta(currentSong);

    if (currentSong.theme) {
      const t = currentSong.theme;
      setTheme({
        vibrant: t.vibrant || "#e91e63",
        muted: t.muted || "#222",
        darkMuted: t.darkMuted || "#111",
        lightMuted: t.lightMuted || "#ccc",
      });
    }

    setPlaying(true);

    if (currentSong.id !== id) {
      router.replace(`/player/${currentSong.id}`);
    }
  }, [currentSong, id, router]);

  /* const togglePlay = () => {
    if (!audioRef.current) return;
    playing ? audioRef.current.pause() : audioRef.current.play();
    setPlaying(!playing);
  }; */

  const togglePlay = async () => {
    if (!audioRef.current) return;

    try {
      if (playing) {
        audioRef.current.pause();
      } else {
        await audioRef.current.play();
      }
      setPlaying(!playing);
    } catch (err) {
      console.warn("Playback error:", err);
    }
  };

  const handleTimeUpdate = () => setCurrentTime(audioRef.current.currentTime);
  const handleLoadedMetadata = () => {
    setDuration(audioRef.current.duration);
    setLoading(false);
  };
  const handleSeek = (e) => {
    audioRef.current.currentTime = e.target.value;
    setCurrentTime(e.target.value);
  };
  const handleVolumeChange = (e) => {
    const vol = e.target.value;
    audioRef.current.volume = vol;
    setVolume(vol);
  };

  const formatTime = (t) =>
    isNaN(t)
      ? "0:00"
      : `${Math.floor(t / 60)}:${("0" + Math.floor(t % 60)).slice(-2)}`;

  const backgroundGradient = `linear-gradient(to bottom, ${theme.darkMuted} 0%, ${theme.muted} 100%)`;

  const handleCanPlayThrough = () => {
    setLoading(false);
    if (!playing) {
      audioRef.current.play();
      setPlaying(true);
    }
  };

  return (
    <div
      className="min-h-screen relative flex items-center justify-center md:rounded-3xl"
      style={{ background: backgroundGradient }}
    >
      <div
        className="absolute inset-0 bg-cover bg-center blur-2xl opacity-20"
        style={{ backgroundImage: `url(${meta.cover})` }}
      />
      <div className="absolute inset-0 bg-black/50" />

      <div className="z-10 relative max-w-lg w-full bg-transparent p-6 flex flex-col items-center">
        <span
          className="uppercase text-xs font-semibold"
          style={{ color: theme.lightMuted }}
        >
          Now Playing
        </span>

        <div className="w-64 h-64 rounded-3xl overflow-hidden shadow-xl mb-4">
          <Image
            src={meta.cover}
            width={400}
            height={400}
            alt={meta.title}
            className="object-cover w-full h-full"
          />
        </div>

        <h1
          className="text-2xl font-bold text-center"
          style={{ color: theme.lightMuted }}
        >
          {meta.title}
        </h1>
        <p className="text-sm mt-1" style={{ color: theme.lightMuted }}>
          {meta.artist}
        </p>
        {meta.album && (
          <p className="italic text-xs" style={{ color: theme.lightMuted }}>
            {meta.album}
          </p>
        )}

        {/* Audio */}
        {meta.url && (
          <audio
            onCanPlayThrough={handleCanPlayThrough}
            key={meta.url}
            preload="auto"
            ref={audioRef}
            src={meta.url}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onEnded={() => {
              if (repeat === "one") {
                audioRef.current.currentTime = 0;
                audioRef.current.play();
              } else {
                setPlaying(false);
                playNext();
              }
            }}
            autoPlay
          />
        )}

        {/* Seekbar */}
        <div className="mt-6 w-full">
          <input
            disabled={loading}
            type="range"
            min="0"
            max={duration}
            value={currentTime}
            onChange={handleSeek}
            className="w-full"
            style={{
              accentColor: theme.vibrant,
              backgroundColor: theme.lightMuted,
              height: "6px",
              borderRadius: "3px",
            }}
          />
          <div
            className="flex justify-between text-xs mt-1"
            style={{ color: theme.lightMuted }}
          >
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex justify-center items-center gap-8 mt-8">
          <button
            onClick={playPrevious}
            className="text-2xl hover:scale-110 transition"
            style={{ color: theme.muted }}
          >
            <FaStepBackward />
          </button>

          <button
            onClick={togglePlay}
            className={`p-4 rounded-full shadow-lg hover:scale-105 transition ${
              loading && "animate-spin"
            }`}
            style={{
              backgroundColor: theme.vibrant,
              color: theme.darkVibrant,
              boxShadow: `0 0 20px ${theme.vibrant}80`,
            }}
          >
            {playing ? <FaPause size={20} /> : <FaPlay size={20} />}
          </button>

          <button
            onClick={playNext}
            className="text-2xl hover:scale-110 transition"
            style={{ color: theme.muted }}
          >
            <FaStepForward />
          </button>
        </div>

        {/* Volume */}
        <div className="flex items-center gap-3 mt-6 w-full px-4">
          <FaVolumeUp className="text-lg" style={{ color: theme.lightMuted }} />
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={handleVolumeChange}
            className="w-10/12"
            style={{
              accentColor: theme.vibrant,
              height: "4px",
              borderRadius: "2px",
            }}
          />
        </div>

        {onTogglePlaylist && (
          <button
            className="fixed bottom-2 left-1/2 transform -translate-x-1/2 z-50 sm:hidden bg-black/40 px-4 py-2 rounded-full text-sm text-white shadow-lg"
            onClick={onTogglePlaylist}
          >
            Open Playlist
          </button>
        )}
      </div>
    </div>
  );
}
