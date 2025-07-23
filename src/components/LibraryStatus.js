"use client";

import { FiMusic, FiClock } from "react-icons/fi";
import useSongStore from "@/lib/songStore";

export default function LibraryStats() {
  const { songs } = useSongStore();

  if (!songs || songs.length === 0) return null;

  const totalSongs = songs.length;
  const totalDurationSeconds = songs.reduce(
    (sum, song) => sum + (song.duration || 0),
    0
  );

  const hours = Math.floor(totalDurationSeconds / 3600);
  const minutes = Math.floor((totalDurationSeconds % 3600) / 60);

  let formattedDuration = "";
  if (hours > 0) formattedDuration += `${hours}h `;
  if (minutes > 0 || hours === 0) formattedDuration += `${minutes}m`;
  formattedDuration = formattedDuration.trim();

  return (
    <section className="bg-white/5 backdrop-blur-lg p-5 rounded-xl shadow border border-white/10">
      <div className="mb-2">
        <h2 className="text-lg font-semibold text-white/90">At a Glance</h2>
      </div>
      <div className="flex flex-wrap items-center gap-6 text-sm text-white/80 font-medium">
        <div className="flex items-center gap-2">
          <FiMusic className="text-white/60 w-4 h-4" />
          <span className="text-white">{totalSongs} Songs</span>
        </div>
        <div className="flex items-center gap-2">
          <FiClock className="text-white/60 w-4 h-4" />
          <span className="text-white">{formattedDuration}</span>
        </div>
      </div>
    </section>
  );
}
