"use client";
import { useEffect, useState } from "react";
import useSongStore from "@/lib/songStore";
import PlayerPage from "./page";
import PlaylistDrawer from "@/components/PlaylistDrawer";

export default function PlayerLayout() {
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
