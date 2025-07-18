"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { FaPause, FaPlay, FaForward } from "react-icons/fa";
import useSongStore from "@/lib/songStore";
import ImageWithFallback from "@/lib/imageWithFallback";
import Link from "next/link";

export default function MiniPlayer() {
  const router = useRouter();
  const pathname = usePathname();
  const [isImageError, setIsImageError] = useState(false);

  const handleImageError = () => {
    setIsImageError(true); // Flag when image fails to load
  };

  const {
    audioRef,
    currentSong,
    songs,
    setCurrentSong,
    playing,
    togglePlay,
    progress,
  } = useSongStore();

  useEffect(() => {
    const interval = setInterval(() => {
      if (audioRef && currentSong) {
        const { currentTime, duration } = audioRef;
        if (duration > 0) {
          useSongStore.getState().setProgress((currentTime / duration) * 100);
        }
      }
    }, 500);

    return () => clearInterval(interval);
  }, [currentSong]);

  const handleNext = (e) => {
    e.stopPropagation(); // Prevent link navigation
    const index = songs.findIndex((s) => s.id === currentSong.id);
    const nextSong = songs[index + 1] || songs[0]; // Loop if end
    setCurrentSong(nextSong);
  };

  const themeColor = currentSong?.theme?.vibrant || "#e91e63";
  const shouldShow =
    currentSong &&
    !pathname.startsWith("/player") &&
    !pathname.startsWith("/sync") &&
    !pathname.startsWith("/settings");

  useEffect(() => {
    if (currentSong?.id) {
      router.prefetch(`/player/${currentSong.id}`);
    }
  }, [currentSong?.id]);

  return (
    <AnimatePresence>
      {shouldShow && (
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 40 }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
          className={`sticky bottom-[3.40rem] left-2 right-2 z-50 bg-black/80 backdrop-blur-lg rounded-t-xl shadow-xl overflow-hidden`}
          style={{
            borderTopColor: `${themeColor}33`,
            borderWidth: "0px",
            borderTopWidth: !playing ? "3px" : "0",
          }}
        >
          <div
            className="transition-all ease-in-out duration-300 w-full absolute top-0 left-0 animate-neon-line"
            style={{
              background: `${themeColor}33`,
              position: "absolute",
              top: 0,
              animation: playing ? "none" : "neon-line 4s linear infinite",
              height: !playing ? "0.05rem" : "0rem",
            }}
          >
            {!playing && (
              <div
                className="h-full bg-gradient-to-r animate-neon-bar"
                style={{
                  background: themeColor,
                  animation: playing
                    ? "none"
                    : "neon-bar 10s ease-in-out infinite",
                  opacity: 0.3,
                }}
              />
            )}
          </div>

          {/* Player Body */}
          <div
            className="flex items-center justify-between px-4 py-2 cursor-pointer"
          >
            {/* Wrap only the song details with the Link */}
            <Link
              href={`/player/${currentSong.id}`}
              passHref
              prefetch
              className="w-full"
            >
              <div className="flex items-center gap-3 w-full">
                <ImageWithFallback
                  src={currentSong.cover}
                  alt={currentSong.title}
                  width={48}
                  height={48}
                  className="rounded shadow object-cover"
                />
                <div className="flex-1 overflow-hidden">
                  <p className="text-sm font-semibold text-white truncate">
                    {currentSong.title}
                  </p>
                  <p className="text-xs text-white/60 truncate">
                    {currentSong.artist}
                  </p>
                </div>
              </div>
            </Link>
            {/* Controls outside of Link */}
            <div className="flex gap-4 items-center z-10">
              {/* Play/Pause Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation(); // Prevent link navigation
                  togglePlay();
                }}
                className="text-white text-lg hover:scale-110 transition"
              >
                {playing ? <FaPause /> : <FaPlay />}
              </button>

              {/* Next Button */}
              <button
                onClick={handleNext}
                className="text-white text-lg hover:scale-110 transition"
              >
                <FaForward />
              </button>
            </div>
          </div>

          {/* Progress Bar */}
          <div
            className="h- transition-all ease-in-out duration-300"
            style={{
              background: `${themeColor}33`,
              position: "relative",
              height: playing ? "0.25rem" : "0",
            }}
          >
            <div
              className="h-full"
              style={{
                width: `${progress}%`,
                background: themeColor,
                transition: "width 0.2s ease",
              }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
