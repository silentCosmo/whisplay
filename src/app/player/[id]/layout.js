"use client";
import { useEffect, useState } from "react";
import useSongStore from "@/lib/songStore";
import PlayerPage from "./page";
import PlaylistDrawer from "@/components/PlaylistDrawer";
import { useRouter } from "next/navigation";
import { FaArrowLeft } from "react-icons/fa";
import Link from "next/link";

export default function PlayerLayout() {
  const router = useRouter();
  const { currentSong } = useSongStore();
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

  return (
    <div className="min-h-screen flex flex-col sm:flex-row relative">
      <div className="flex-1 relative">
        <header
          className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20 w-[90%] max-w-5xl px-6 py-3 rounded-full flex justify-between items-center backdrop-blur-md bg-black/30 border border-white/10 shadow-lg"
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
              Whisplay
            </span>
          </span>

          <div className="text-xs opacity-60">v1.0</div>
        </header>
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
