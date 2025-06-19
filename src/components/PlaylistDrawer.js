"use client";

import useSongStore from "@/lib/songStore";
import Image from "next/image";
import { FaBan, FaInfinity, FaPlay, FaTimes } from "react-icons/fa";
import { FaRandom, FaRedo, FaRedoAlt } from "react-icons/fa";

export default function PlaylistDrawer({ theme, isMobile = false, onClose }) {
  const {
    songs,
    currentSong,
    setCurrentSong,
    shuffle,
    repeat,
    toggleShuffle,
    toggleRepeat,
    getShuffledSongs,
  } = useSongStore();

  const displaySongs = shuffle ? getShuffledSongs() : songs;

  const handleSelect = (song) => {
    setCurrentSong(song);
    if (isMobile && onClose) onClose(); // close drawer on mobile
  };

  return (
    <aside
      className={`${
        isMobile
          ? "bg-black/90 backdrop-blur-sm max-h-[75vh] rounded-t-2xl overflow-hidden"
          : "h-full"
      } p-4`}
      style={{
        background: isMobile ? theme.darkMuted : theme.muted,
        color: theme.lightMuted,
      }}
    >
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold" style={{ color: theme.vibrant }}>
          Playlist
        </h2>
        <button
          onClick={toggleShuffle}
          title="Shuffle"
          className="transition hover:scale-110"
          //className={shuffle ? "text-green-400" : "text-gray-400"}
          style={{
            color: shuffle ? theme.vibrant : theme.lightMuted,
            opacity: shuffle ? 1 : 0.4,
            filter: shuffle
              ? `drop-shadow(0 0 4px ${theme.vibrant}90)`
              : "none",
          }}
        >
          <FaRandom />
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={toggleRepeat}
            title={`Repeat: ${repeat}`}
            className="transition hover:scale-110"
          >
            {repeat === "none" && (
              <FaRedo
                style={{
                  color: theme.lightMuted,
                  opacity: 0.4,
                }}
              />
            )}
            {repeat === "one" && (
              <FaRedoAlt
                style={{
                  color: theme.vibrant,
                  filter: `drop-shadow(0 0 4px ${theme.vibrant}90)`,
                }}
              />
            )}
            {repeat === "all" && (
              <FaInfinity
                style={{
                  color: theme.vibrant,
                  filter: `drop-shadow(0 0 4px ${theme.vibrant}90)`,
                }}
              />
            )}
          </button>
        </div>

        {isMobile && (
          <button onClick={onClose} className="text-xl">
            <FaTimes />
          </button>
        )}
      </div>

      <ul className="space-y-3 overflow-y-auto max-h-[65vh] sm:max-h-none">
        {displaySongs.map((song) => {
          const active = currentSong?.id === song.id;
          return (
            <li
              key={song.id}
              className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all ${
                active ? "shadow-md ring-1 ring-white/30" : "hover:bg-white/10"
              }`}
              onClick={() => handleSelect(song)}
              style={{
                backgroundColor: active ? theme.vibrant : "transparent",
                color: active ? theme.darkMuted : theme.lightMuted,
              }}
            >
              <Image
                src={song.cover}
                width={50}
                height={50}
                alt={song.title}
                className="rounded object-cover"
              />
              <div className="flex-1 overflow-hidden">
                <p className="truncate font-medium">{song.title}</p>
                <p className="text-xs truncate">{song.artist}</p>
              </div>
              {active && <FaPlay className="text-xs" />}
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
