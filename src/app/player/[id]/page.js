"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import useSongStore from "@/lib/songStore";
import {
  FaPlay,
  FaPause,
  FaVolumeUp,
  FaRedo,
  FaStepBackward,
  FaStepForward,
} from "react-icons/fa";
import { IoMdShuffle } from "react-icons/io";
import ColorThief from "color-thief-browser";
import Image from "next/image";

export default function PlayerPage() {
  const { id } = useParams();
  const {
    songs,
    currentSong,
    currentIndex,
    setCurrentSong,
    playNext,
    playPrevious,
  } = useSongStore();

  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(1);
  const [bgColor, setBgColor] = useState("#1a1a1a");
  const [meta, setMeta] = useState({
    title: "Loading title...",
    artist: "Loading artist...",
    album: "Loading album...",
    cover: "/loading.jpg",
  });

  // Load meta and theme
  useEffect(() => {
    const fetchMeta = async () => {
      if (currentSong && currentSong.id === id) {
        setMeta(currentSong);
        extractThemeColor(currentSong.cover);
      } else {
        const res = await fetch(`/api/meta/${id}`);
        const data = await res.json();
        
        const cover = data.cover ? `/api/cover/${id}` : "/default.png";
        
        console.log('cover:' , data.cover);
        
        const metaObj = {
          title: data.title || "Unknown Title",
          artist: data.artist || "Unknown Artist",
          album: data.album || "Unknown Album",
          cover,
        };
        setMeta(metaObj);
        extractThemeColor(cover);
        setCurrentSong(metaObj);
      }
    };

    fetchMeta();
  }, [id]);

  const extractThemeColor = async (coverUrl) => {
    try {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = coverUrl;
      img.onload = () => {
        const color = new ColorThief().getColor(img);
        setBgColor(`rgb(${color.join(",")})`);
      };
    } catch (err) {
      console.warn("🎨 Failed to extract color", err);
    }
  };

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (playing) {
      audio.pause();
    } else {
      audio.play();
    }
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

  const formatTime = (time) =>
    isNaN(time)
      ? "0:00"
      : `${Math.floor(time / 60)}:${("0" + Math.floor(time % 60)).slice(-2)}`;

  return (
    <div
      className="min-h-screen w-full p-6 flex flex-col items-center text-white transition-all duration-700"
      style={{
        background: `linear-gradient(160deg, ${bgColor} 20%, #000)`,
      }}
    >
      <div className="w-64 h-64 rounded-2xl overflow-hidden shadow-lg mb-4">
        <Image
          height={400}
          width={400}
          src={meta.cover}
          alt={meta.title}
          className="w-full h-full object-cover"
        />
      </div>

      <h1 className="text-2xl font-bold text-center">{meta.title}</h1>
      <p className="text-pink-300">{meta.artist}</p>
      <p className="text-pink-400 italic">{meta.album}</p>

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

      {/* Seekbar */}
      <div className="mt-6 w-full max-w-xl">
        <input
          type="range"
          min={0}
          max={duration}
          value={currentTime}
          onChange={handleSeek}
          className="w-full accent-pink-400"
        />
        <div className="flex justify-between text-sm text-pink-300 mt-1">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>

        {/* Controls */}
        <div className="flex justify-center items-center gap-6 mt-4 text-2xl text-pink-300">
          <button onClick={playPrevious}>
            <FaStepBackward />
          </button>
          <button
            onClick={togglePlay}
            className="text-white bg-pink-600 p-3 rounded-full shadow-lg hover:bg-pink-500 transition"
          >
            {playing ? <FaPause /> : <FaPlay />}
          </button>
          <button onClick={playNext}>
            <FaStepForward />
          </button>
        </div>

        {/* Volume */}
        <div className="flex items-center gap-2 mt-4">
          <FaVolumeUp className="text-pink-300" />
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={volume}
            onChange={handleVolumeChange}
            className="w-full accent-pink-400"
          />
        </div>
      </div>
    </div>
  );
}
