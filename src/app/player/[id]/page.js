"use client";

import usePersistentState from "@/lib/usePersistentState";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import useSongStore from "@/lib/songStore";
import {
  FaPlay,
  FaPause,
  FaVolumeUp,
  FaStepBackward,
  FaStepForward,
  FaCompactDisc,
  FaTint,
  FaCircleNotch,
  FaCircle,
} from "react-icons/fa";
import { LuAudioWaveform } from "react-icons/lu";
import { PiWaveformBold } from "react-icons/pi";
import { SiCircle } from "react-icons/si";
import { RxBarChart } from "react-icons/rx";
import { GiBurstBlob } from "react-icons/gi";
import { RiScan2Line, RiBubbleChartFill } from "react-icons/ri";

import VisualizerCanvas from "@/lib/visualizerCanvas";

import { FaVolumeMute, FaVolumeDown } from "react-icons/fa";
import ImageWithFallback from "@/lib/imageWithFallback";

export default function PlayerPage({ onTogglePlaylist }) {
  const { id } = useParams();
  const router = useRouter();
  const {
    audioRef,
    currentSong,
    setCurrentSong,
    playNext,
    playPrevious,
    repeat,
    playing,
    setPlaying,
    duration,
    currentTime,
    progress,
    //setProgress,
    setDuration,
    songs,
  } = useSongStore();

  const modeIcons = {
    mirror: <PiWaveformBold />,
    wave: <LuAudioWaveform />,
    aura: <FaCircle />,
    blob: <GiBurstBlob />,
    liquid: <FaTint />,
    pulsewave: <RiScan2Line />,
    sparkle: <RiBubbleChartFill />,
    rings: <SiCircle />,
    beatsplash: <RxBarChart />,
  };
  const [loading, setLoading] = useState(true);
  const [vizReady, setVizReady] = useState(false);

  const [beatLevel, setBeatLevel] = useState(0);

  const [volume, setVolume] = usePersistentState("volume", 1);
  const [vizMode, setVizMode] = usePersistentState("vizMode", "beatsplash");
  const [showCover, setShowCover] = usePersistentState("showCover", true);
  const [showModeName, setShowModeName] = useState(false);

  const modes = [
    //"spectrum",
    "mirror",
    "wave",
    "aura",
    "blob",
    "liquid",
    "pulsewave",
    "sparkle",
    "rings",
    "beatsplash",
  ];

  useEffect(() => {
    if (vizMode) {
      setVizReady(true);
    }
  }, [vizMode]);

  useEffect(() => {
    if (showModeName) {
      const timeout = setTimeout(() => setShowModeName(false), 900);
      return () => clearTimeout(timeout);
    }
  }, [showModeName]);

  const toggleMode = () => {
    const currentIndex = modes.indexOf(vizMode);
    const next = (currentIndex + 1) % modes.length;
    setVizMode(modes[next]);
  };

  const [theme, setTheme] = useState({
    vibrant: "#e91e63",
    muted: "#222",
    darkMuted: "#111",
    lightMuted: "#ccc",
    darkVibrant: "green",
  });

  const [meta, setMeta] = useState({
    id: "cosmo",
    title: "Loading…",
    artist: "Loading…",
    album: "",
    cover: "/loading.jpg",
    url: "",
  });

  /* Volume */
  const [muted, setMuted] = useState(false);
  const [hovering, setHovering] = useState(false);

  useEffect(() => {
    if (audioRef) {
      audioRef.volume = muted ? 0 : volume;
    }
  }, [volume, muted]);

  const toggleMute = () => setMuted((prev) => !prev);

  const getVolumeIcon = () => {
    if (muted || volume === 0) return <FaVolumeMute />;
    if (volume < 0.5) return <FaVolumeDown />;
    return <FaVolumeUp />;
  };

  useEffect(() => {
    if (!currentSong && id) {
      fetch(`/api/meta/${id}`)
        .then((r) => r.json())
        .then((data) => {
          const songData = {
            id,
            title: data.title,
            artist: data.artist,
            album: data.album,
            cover: data.cover ? `/api/cover/${id}` : "/default.png",
            url: `/api/song?id=${id}`,
            theme: data.theme,
            format: data.format,
            bitrate: data.bitrate,
            sampleRate: data.sampleRate,
            bitDepth: data.bitDepth,
            qualityText: data.qualityText,
          };

          setCurrentSong(songData);
          setMeta(songData);
        });
    }
  }, [id, currentSong]);

  useEffect(() => {
    console.log("🧠 songs:", songs); // check if qualityText is there
  }, [currentSong]);

  useEffect(() => {
    const interval = setInterval(() => {
      const audio = useSongStore.getState().audioRef;
      if (audio && !isNaN(audio.duration)) {
        const { currentTime, duration } = audio;
        const progress = (currentTime / duration) * 100;
        useSongStore.getState().setCurrentTime(currentTime);
        useSongStore.getState().setProgress(progress);
      }
    }, 500);

    return () => clearInterval(interval);
  }, [currentSong]);

  useEffect(() => {
    if (!currentSong) return;

    setMeta({
      id: currentSong.id, // 🆔 required for key
      title: currentSong.title,
      artist: currentSong.artist,
      album: currentSong.album,
      cover: currentSong.cover,
      url: currentSong.url,
      format: currentSong.format,
      bitrate: currentSong.bitrate,
      sampleRate: currentSong.sampleRate,
      bitDepth: currentSong.bitDepth,
      qualityText: currentSong.qualityText,
    });

    if (currentSong.theme) {
      const t = currentSong.theme;
      setTheme({
        vibrant: t.vibrant || "#e91e63",
        muted: t.muted || "#222",
        darkMuted: t.darkMuted || "#111",
        lightMuted: t.lightMuted || "#ccc",
        darkVibrant: t.darkVibrant || "#000",
      });
    } else {
      setTheme({
        vibrant: "#ff4081",
        muted: "#222",
        darkMuted: "#111",
        lightMuted: "#ccc",
        darkVibrant: "#000",
      });
    }

    setPlaying(true);

    if (currentSong.id !== id) {
      router.replace(`/player/${currentSong.id}`);
    }
  }, [currentSong, id, router]);

  const togglePlay = () => {
    if (!audioRef) return;
    playing ? audioRef.pause() : audioRef.play();
    setPlaying(!playing);
  };

  useEffect(() => {
    if (duration > 0) {
      setLoading(false);
    }
  }, [duration]);

  /* const handleSeek = (e) => {
    const time = parseFloat(e.target.value);
    if (audioRef?.current) {
      audioRef.current.currentTime = time;
    }
    setProgress(time);
  }; */

  const handleSeek = (e) => {
    const time = parseFloat(e.target.value);
    useSongStore.getState().seekTo(time);
  };

  const handleVolumeChange = (e) => {
    const vol = parseFloat(e.target.value);
    if (audioRef?.current) {
      audioRef.current.volume = vol;
    }
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
      audioRef.play();
      setPlaying(true);
    }
  };

  return (
    <div
      className="min-h-[100dvh] relative flex items-center justify-center md:rounded-3xl"
      style={{ background: backgroundGradient }}
    >
      <div
        className="absolute inset-0 bg-cover bg-center blur-2xl opacity-20"
        style={{ backgroundImage: `url(${meta.cover})` }}
      />
      <div className="absolute inset-0 bg-black/50" />

      <div className="z-10 relative max-w-lg w-full bg-transparent flex flex-col items-center">
        <div className="relative w-full md:h-[400px] h-[330px] mb-6 flex items-center justify-center">
          <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
            <motion.div
              className="overflow-hidden rounded-[inherit]"
              style={{
                borderRadius: showCover ? 24 : 0,
              }}
              animate={{
                width: showCover ? 256 : 400,
                height: showCover ? 256 : 400,
                scale: showCover ? 1 + beatLevel * 0.06 : 1 + beatLevel * 0.0,
              }}
              transition={{
                type: "spring",
                stiffness: 100,
                damping: 12,
              }}
            >
              <VisualizerCanvas
                audioRef={audioRef}
                audioSrc={meta.id}
                theme={theme}
                mode={vizMode}
                onBeat={(level) => {
                  const intensity = Math.min(level / 200, 1);
                  setBeatLevel(intensity);
                }}
              />
            </motion.div>
          </div>

          <motion.div
            className="relative overflow-hidden"
            onClick={(e) => {
              if (e.target.tagName !== "INPUT") setShowCover(!showCover);
            }}
            style={{
              borderRadius: showCover ? 24 : 0,
              aspectRatio: "1 / 1",
            }}
            animate={{
              width: showCover ? 256 : 400,
              height: showCover ? 256 : 400,
              scale: 1 + beatLevel * 0.06,
            }}
            transition={{
              type: "spring",
              stiffness: 100,
              damping: 12,
            }}
          >
            {/* Cover Image Layer */}
            <AnimatePresence mode="wait">
              {showCover && (
                <motion.div
                  key="cover"
                  className="absolute inset-0 z-10"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.05 }}
                  transition={{ duration: 0.5, ease: "easeInOut" }}
                >
                  <ImageWithFallback
                    src={meta.cover}
                    width={400}
                    height={400}
                    alt={meta.title}
                    className="object-cover w-full h-full"
                    style={{
                      filter:
                        playing && !loading
                          ? "brightness(0.5)"
                          : "brightness(0.9)",
                    }}
                    //onClick={toggleMode}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        <div
          className="mt-4 flex gap-3 items-center justify-center text-xs relative"
          style={{ color: theme.lightMuted }}
        >
          <button
            disabled={!vizReady}
            onClick={() => {
              toggleMode();
              setShowModeName(true);
            }}
            className={`p-3 rounded-2xl transition text-xl active:scale-50
      ${
        vizReady
          ? "rbg-black/20 ractive:bg-black/5"
          : "bg-white/5 animate-pulse cursor-not-allowed"
      }`}
          >
            {vizReady ? (
              modeIcons[vizMode]
            ) : (
              <FaCircleNotch className="animate-spin" />
            )}
          </button>

          <AnimatePresence>
            {showModeName && (
              <motion.div
                key="mode-name"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0 }}
                transition={{ duration: 0.3 }}
                className="absolute -top-10 px-4 py-2 rounded-xl text-sm text-white/50 pointer-events-none"
              >
                {vizMode}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="w-full overflow-hidden">
          <div className="relative whitespace-nowrap">
            <div
              className="text-2xl font-bold text-center mx-auto w-max transition-all"
              style={{
                color: theme.lightMuted,
                animation:
                  meta.title.length > 30
                    ? "scroll-text 15s linear infinite"
                    : "none",
              }}
            >
              {meta.title}
            </div>
          </div>
        </div>

        <div className="w-full overflow-hidden mt-1">
          <div className="relative whitespace-nowrap">
            <div
              className="text-sm text-center mx-auto w-max transition-all"
              style={{
                color: theme.lightMuted,
                animation:
                  meta.artist.length > 30
                    ? "scroll-text 10s linear infinite"
                    : "none",
              }}
            >
              {meta.artist}
            </div>
          </div>
        </div>

        <section className="w-full  px-6">
          <div className="mt-6 w-full">
            <div className="relative w-full h-3 bg-black/20 rounded-full overflow-hidden group">
              <div
                className="absolute top-0 left-0 h-full bg-pink-500 transition-all"
                style={{
                  width: `${progress}%`,
                  backgroundColor: theme.vibrant,
                }}
              ></div>
              <input
                disabled={loading}
                type="range"
                min="0"
                max={duration}
                step="0.1"
                value={currentTime}
                onChange={handleSeek}
                className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>
            <div
              className="flex justify-between text-xs mt-1"
              style={{ color: theme.lightMuted }}
            >
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {meta.qualityText && (
            <div className="w-full overflow-hidden mt-1">
              <div className="relative whitespace-nowrap">
                <div
                  className="text-xs text-center mx-auto w-max font-mono tracking-wide opacity-80"
                  style={{
                    color: theme.lightMuted,
                    animation:
                      meta.qualityText.length > 40
                        ? "scroll-text 12s linear infinite"
                        : "none",
                  }}
                >
                  {meta.qualityText}
                </div>
              </div>
            </div>
          )}

          {/* Controls */}
          <div className="flex justify-center items-center gap-8 mt-8">
            <button
              onClick={playPrevious}
              className="text-2xl hover:scale-110 transition opacity-80"
              style={{ color: theme.vibrant }}
            >
              <FaStepBackward />
            </button>

            <motion.button
              whileTap={{ scale: 0.9 }}
              whileHover={{ scale: 1.1 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
              className={`rounded-full shadow-lg ${
                loading ? "animate-spi p-1" : "p-4"
              }`}
              style={{
                backgroundColor: theme.vibrant,
                color: theme.darkVibrant,
                boxShadow: `0 0 20px ${theme.vibrant}80`,
              }}
              onClick={togglePlay}
            >
              {loading ? (
                <FaCompactDisc
                  className="animate-spin"
                  size={40}
                  style={{ color: theme.darkVibrant }}
                />
              ) : playing ? (
                <FaPause />
              ) : (
                <FaPlay />
              )}
            </motion.button>

            <button
              onClick={playNext}
              className="text-2xl hover:scale-110 transition opacity-80"
              style={{ color: theme.vibrant }}
            >
              <FaStepForward />
            </button>
          </div>

          {/* Volume Control */}
          <div className="w-full mt-6 px-4">
            <div className="flex items-center gap-3">
              <button
                className="text-lg hover:scale-110 transition"
                onClick={toggleMute}
                style={{ color: theme.lightMuted }}
              >
                {getVolumeIcon()}
              </button>

              <div
                className="relative w-10/12 h-3 rounded-full bg-black/2/*  */0 group overflow-hidden cursor-pointer"
                onMouseEnter={() => setHovering(true)}
                onMouseLeave={() => setHovering(false)}
                onTouchStart={() => setHovering(true)}
                onTouchEnd={() => setHovering(false)}
              >
                {/* Filled Volume */}
                <div
                  className="absolute top-0 left-0 h-full rounded-full transition-all"
                  style={{
                    width: `${(muted ? 0 : volume) * 100}%`,
                    backgroundColor: theme.vibrant,
                    boxShadow: `0 0 8px ${theme.vibrant}80`,
                  }}
                ></div>

                {/* Range Input (hidden visually, interactive layer) */}
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={muted ? 0 : volume}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    setMuted(val === 0);
                    setVolume(val);
                  }}
                  className="absolute top-0 left-0 w-full h-full opacity-0"
                />

                {/* Tooltip */}
                {hovering && (
                  <div
                    className="absolute -top-8 left-[calc(var(--vol)*100%)] transform -translate-x-1/2 text-white text-xs px-2 py-1 rounded-full bg-black/70 shadow-lg pointer-events-none"
                    style={{
                      "--vol": muted ? 0 : volume,
                    }}
                  >
                    {Math.round((muted ? 0 : volume) * 100)}%
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

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
