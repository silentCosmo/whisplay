"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { FaPause, FaPlay, FaForward } from "react-icons/fa";
import useSongStore from "@/lib/songStore";
import ImageWithFallback from "@/lib/imageWithFallback";
//import audio from "@/lib/audio";

export default function MiniPlayer() {
  const router = useRouter();
  const pathname = usePathname();
  const [isImageError, setIsImageError] = useState(false);

  const handleImageError = () => {
    setIsImageError(true); // Flag when image fails to load
  };
  //const { songs, currentSong, setCurrentSong } = useSongStore();

  //const [playing, setPlaying] = useState(false);
  //const [progress, setProgress] = useState(0);
  const {
    audioRef,
    currentSong,
    songs,
    setCurrentSong,
    playing,
    togglePlay,
    progress,
  } = useSongStore();

  // ▶️ Autoplay on song change
  // Autoplay only if song changed
  /* useEffect(() => {
  if (!audioRef.current || !currentSong?.url) return;

  const audio = audioRef.current;

  if (audio.src !== location.origin + currentSong.url) {
    audio.src = currentSong.url;
    audio.load();
    audio
      .play()
      .then(() => setPlaying(true))
      .catch(() => setPlaying(false));
  }
}, [currentSong]); */

  // 🟩 Track progress
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

  // ▶️⏸️ Toggle
  /* onst togglePlay = () => {
    if (!audioRef.current) return;
    if (playing) {
      audioRef.current.pause();
      setPlaying(false);
    } else {
      audioRef.current.play();
      setPlaying(true);
    }
  }; */

  // ⏭️ Skip to next
  const handleNext = (e) => {
    e.stopPropagation();
    const index = songs.findIndex((s) => s.id === currentSong.id);
    const nextSong = songs[index + 1] || songs[0]; // Loop if end
    setCurrentSong(nextSong);
  };

  const themeColor = currentSong?.theme?.vibrant || "#e91e63";
  const shouldShow = currentSong && (!pathname.startsWith("/player") && !pathname.startsWith("/sync"));
  /* const shouldShow =
    currentSong && !pathname.startsWith(`/player`); */
    //currentSong && !pathname.startsWith(`/player/${currentSong.id}`);

  return (
    <AnimatePresence>
      {shouldShow && (
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 40 }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
          className="sticky bottom-14 left-2 right-2 z-50 bg-black/80 backdrop-blur-lg rounded-xl shadow-xl overflow-hidden"
        >
          {/* <audio ref={audioRef} preload="auto" /> */}
          {/* Progress Bar */}
          <div
            className="h-1"
            style={{
              background: `${themeColor}33`,
              position: "relative",
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

          {/* Player Body */}
          <div
            className="flex items-center justify-between px-4 py-2 cursor-pointer"
            onClick={() => router.push(`/player/${currentSong.id}`)}
          >
            <div className="flex items-center gap-3 w-full">
              <ImageWithFallback
                src={currentSong.cover}
                alt={currentSong.title}
                width={48}
                height={48}
                className="rounded shadow object-cover"
                //onError={handleImageError}
              />
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-semibold text-white truncate">
                  {currentSong.title}
                </p>
                <p className="text-xs text-white/60 truncate">
                  {currentSong.artist}
                </p>
              </div>
              <div className="flex gap-4 items-center z-10">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    togglePlay();
                  }}
                  className="text-white text-lg hover:scale-110 transition"
                >
                  {playing ? <FaPause /> : <FaPlay />}
                </button>
                <button
                  onClick={handleNext}
                  className="text-white text-lg hover:scale-110 transition"
                >
                  <FaForward />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
