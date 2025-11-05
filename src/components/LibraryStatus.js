"use client";

import { FiMusic, FiClock, FiBook } from "react-icons/fi";
import useSongStore from "@/lib/songStore";

export default function LibraryStats() {
  const { songs } = useSongStore();

  if (!songs || songs.length === 0) return null;

  // Separate songs and audiobooks
  const musicTracks = songs.filter((song) => song.type !== "audiobook");
  const audiobooks = songs.filter((song) => song.type === "audiobook");

  // Helper to format duration
  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    let str = "";
    if (hours > 0) str += `${hours}h `;
    if (minutes > 0 || hours === 0) str += `${minutes}m`;
    return str.trim();
  };

  const totalSongDuration = musicTracks.reduce(
    (sum, s) => sum + (s.duration || 0),
    0
  );
  const totalAudiobookDuration = audiobooks.reduce(
    (sum, s) => sum + (s.duration || 0),
    0
  );

  return (
    <section className="bg-white/5 backdrop-blur-lg p-5 rounded-xl shadow border border-white/10">
      <div className="mb-2">
        <h2 className="text-lg font-semibold text-white/90">At a Glance</h2>
      </div>
      <div className="flex flex-wrap items-center gap-6 text-sm text-white/80 font-medium">

        {/* 🎵 Music Section */}
        <div className="flex items-center gap-2">
          <FiMusic className="text-white/60 w-4 h-4" />
          <span className="text-white">{musicTracks.length} Songs</span>
        </div>
        <div className="flex items-center gap-2">
          <FiClock className="text-white/60 w-4 h-4" />
          <span className="text-white">{formatDuration(totalSongDuration)}</span>
        </div>

        {/* 🎧 Audiobook Section */}
        {audiobooks.length > 0 && (
          <>
            <div className="flex items-center gap-2">
              <FiBook className="text-white/60 w-4 h-4" />
              <span className="text-white">{audiobooks.length} Audiobooks</span>
            </div>
            <div className="flex items-center gap-2">
              <FiClock className="text-white/60 w-4 h-4" />
              <span className="text-white">{formatDuration(totalAudiobookDuration)}</span>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
