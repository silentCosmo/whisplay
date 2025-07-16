"use client";
import { useEffect, useRef, useState } from "react";
import useSongStore from "@/lib/songStore";
import PlayerPage from "./[id]/page";
import PlaylistDrawer from "@/components/PlaylistDrawer";
import { useRouter } from "next/navigation";
import { FaArrowLeft } from "react-icons/fa";
import Link from "next/link";
import Whisplay from "@/utils/appName";
import { togglePlayPause } from "@/lib/audioPlayer";

export default function PlayerLayout() {
  const router = useRouter();
  const {
    currentSong,
    currentTime,
    duration,
    playing,
    setPlaying,
    playNext,
    playPrevious,
  } = useSongStore();
  const [showPlaylist, setShowPlaylist] = useState(false);
  const [theme, setTheme] = useState({
    vibrant: "#e91e63",
    muted: "#222",
    darkMuted: "#111",
    lightMuted: "#ccc",
  });

  useEffect(() => {
    if (currentSong?.theme) {
      const t = currentSong.theme;
      setTheme({
        vibrant: t.vibrant || "#e91e63",
        muted: t.muted || "#222",
        darkMuted: t.darkMuted || "#111",
        lightMuted: t.lightMuted || "#ccc",
      });
    }
  }, [currentSong]);

  const lastValidSongRef = useRef(null);

  useEffect(() => {
    const song = currentSong || lastValidSongRef.current;
    if (!song) return;

    if (currentSong) lastValidSongRef.current = currentSong;

    if ("mediaSession" in navigator /* && currentSong && duration */) {
      // Set initial metadata with artwork and so on (like before)
      navigator.mediaSession.metadata = new MediaMetadata({
        title: currentSong.title,
        artist: currentSong.artist,
        album: currentSong.album || "",
        artwork: [
          {
            src: `/api/proxy/image?src=${encodeURIComponent(
              currentSong.cover
            )}`,
            sizes: "512x512",
            type: "image/jpeg",
          },
          // add more sizes as needed
        ],
      });

      // Action handlers (play, pause, next, prev, disable seek buttons)
      navigator.mediaSession.setActionHandler("play", () => setPlaying(true));
      navigator.mediaSession.setActionHandler("pause", () => setPlaying(false));
      navigator.mediaSession.setActionHandler("nexttrack", () => playNext());
      navigator.mediaSession.setActionHandler("previoustrack", () =>
        playPrevious()
      );
      navigator.mediaSession.setActionHandler("seekbackward", null);
      navigator.mediaSession.setActionHandler("seekforward", null);
      navigator.mediaSession.setActionHandler("seekto", null);

      const updatePosition = () => {
        if (
          "setPositionState" in navigator.mediaSession &&
          duration &&
          currentTime != null &&
          playing
        ) {
            try{
          navigator.mediaSession.setPositionState({
            duration: duration,
            position: currentTime,
            playbackRate: 1,
          });
          } catch (e){
            console.warn("MediaSession position update failed", e);
          }
        }
      };

      // Update immediately and then start interval updates every second
      updatePosition();
      const interval = setInterval(updatePosition, 1000);

      // Cleanup interval on unmount or dependency change
      return () => clearInterval(interval);
    }
  }, [currentSong, currentTime, duration, playing]);

  return (
    <div className="min-h-[100dvh] flex flex-col sm:flex-row relative">
      <div className="flex-1 relative">
        {/* <header
          //className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20 w-[90%] max-w-5xl px-6 py-3 rounded-full flex justify-between items-center backdrop-blur-md bg-black/30 border border-white/10 shadow-lg"
          className="absolute top-0 pt-10 left-1/2 transform -translate-x-1/2 z-20 w-[100%] max-w-5xl px-6 py-3 flex justify-between items-center bg-gradient-to-b from-black/30 to-transparent"
          style={{ color: theme.lightMuted }}
        >
          <Link
            href="/"
            prefetch
            className="flex items-center gap-1 text-sm hover:text-white transition font-medium"
          >
            <FaArrowLeft />
          </Link>

          <span className="tracking-wide text-sm sm:text-base font-semibold text-white/80">
            <span
              style={{
                color: theme.vibrant,
                fontWeight: 800,
                letterSpacing: "0.1em",
              }}
            >
              <Whisplay className={"text-2xl font-bold"} />
            </span>
          </span>

          <div className="text-xs opacity-60">v1.0</div>
        </header> */}
        <PlayerPage onTogglePlaylist={() => setShowPlaylist((prev) => !prev)} />
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden sm:block w-[360px] border-l border-black/30 bg-black/20">
        <PlaylistDrawer theme={theme} />
      </div>

      {/* Mobile Slide-up Drawer */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-50 transition-transform duration-300 sm:hidden ${
          showPlaylist ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <PlaylistDrawer
          theme={theme}
          onClose={() => setShowPlaylist(false)}
          isMobile
        />
      </div>
    </div>
  );
}
