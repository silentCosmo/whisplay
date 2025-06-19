"use client";

import useSongStore from "@/lib/songStore";
import Image from "next/image";
import { FaPlay } from "react-icons/fa";

export default function PlaylistSidebar({ theme }) {
  const { songs, currentSong, setCurrentSong } = useSongStore();

  const handlePlay = (song) => {
    if (currentSong?.id !== song.id) setCurrentSong(song);
  };

  return (
    <aside
      className="h-screen overflow-y-auto p-4"
      style={{
        background: theme.darkMuted,
        color: theme.lightMuted,
      }}
    >
      <h2 className="text-lg font-semibold mb-4" style={{ color: theme.vibrant }}>
        Playlist
      </h2>

      <ul className="space-y-3">
        {songs.map((song) => {
          const isActive = currentSong?.id === song.id;

          return (
            <li
              key={song.id}
              onClick={() => handlePlay(song)}
              className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all ${
                isActive
                  ? "shadow-lg ring-2 ring-offset-2"
                  : "hover:bg-white/10"
              }`}
              style={{
                backgroundColor: isActive ? theme.vibrant : "transparent",
                color: isActive ? theme.darkMuted : theme.lightMuted,
              }}
            >
              <Image
                src={song.cover || "/default.png"}
                alt={song.title}
                width={50}
                height={50}
                className="rounded object-cover"
              />

              <div className="flex-1 overflow-hidden">
                <p className="font-medium truncate">{song.title}</p>
                <p className="text-xs truncate">{song.artist}</p>
              </div>

              {isActive && (
                <FaPlay className="text-xs" style={{ color: theme.darkMuted }} />
              )}
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
