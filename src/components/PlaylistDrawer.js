"use client";

import ImageWithFallback from "@/lib/imageWithFallback";
import useSongStore from "@/lib/songStore";
import {
  FaBan,
  FaInfinity,
  FaPlay,
  FaPlusCircle,
  FaTimes,
} from "react-icons/fa";
import { FaRandom, FaRedo, FaRedoAlt } from "react-icons/fa";
import { CgPlayListCheck } from "react-icons/cg";
import { TbPlaylistX, TbPlaylistAdd } from "react-icons/tb";
import { useState } from "react";
import ConfirmModal from "./ConfirmModal";

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
    shuffledSongs,
    getCurrentPlaylistSongs,
    queue,
    addToQueue,
  } = useSongStore();

  const [confirmClear, setConfirmClear] = useState(false);

  const playlistSongs = getCurrentPlaylistSongs?.() || [];
  const displaySongs = shuffle ? shuffledSongs : playlistSongs;
  const upcomingSongs =
    useSongStore.getState().generateSmartAutoplayPreview?.() || [];

  const handleSelect = (song, isFromAutoplay = false) => {
    if (isFromAutoplay) {
      const { generateSmartAutoplay } = useSongStore.getState();
      generateSmartAutoplay(song);
    }
    setCurrentSong(song);
    useSongStore.getState().setPlaying(true);
    if (isMobile && onClose) onClose();
  };

  const handleHover = (song) => {
    fetch(`/api/song?id=${song.id}`, { method: "HEAD" }).catch((err) =>
      console.warn("Hover prewarm failed:", err)
    );
  };

  return (
    <aside
      className={`${
        isMobile
          ? "bg-black/90 backdrop-blur-sm max-h-[75vh] rounded-t-2xl overflow-hidden"
          : "h-[100vh] overflow-y-auto ml-5 rounded-3xl"
      } p-4`}
      style={{
        background: isMobile ? theme.darkMuted : theme.muted,
        color: theme.lightMuted,
      }}
    >
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold" style={{ color: theme.vibrant }}>
          {playlistSongs.length <= 1 ? "Now Playing" : "Playlist"}
        </h2>

        <button
          onClick={toggleShuffle}
          title="Shuffle"
          className="transition hover:scale-110"
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
              <FaRedo style={{ color: theme.lightMuted, opacity: 0.4 }} />
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
        {/* 🎵 CURRENT PLAYING SONG */}
        {currentSong && (
          <>
            <li
              className="text-sm font-semibold mb-2"
              style={{ color: theme.vibrant }}
            >
              Now Playing
            </li>
            <li
              className="flex items-center gap-3 p-3 rounded-lg bg-white/5"
              style={{ color: theme.darkMuted }}
            >
              <ImageWithFallback
                src={currentSong.cover}
                width={50}
                height={50}
                alt={currentSong.title}
                className="rounded object-cover"
              />
              <div className="flex-1 overflow-hidden">
                <p className="truncate font-medium">{currentSong.title}</p>
                <p className="text-xs truncate">{currentSong.artist}</p>
              </div>
              <FaPlay className="text-xs opacity-80" />
            </li>
            <hr className="my-2 border-white/10" />
          </>
        )}

        {/* 🎯 QUEUE LIST */}
        {queue.length > 0 && (
          <>
            <div className="flex justify-between items-center mb-2">
              <li
                className="text-sm font-semibold"
                style={{ color: theme.vibrant }}
              >
                Queued Songs
              </li>
              <button
                className="text-xs text-white/50 hover:text-white transition"
                onClick={() => setConfirmClear(true)}
              >
                Clear All
              </button>
            </div>

            {queue.map((song) => {
              const isCurrent = currentSong?.id === song.id;
              return (
                <li
                  key={song.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-white/5"
                  //style={{ color: theme.lightMuted }}
                  onMouseEnter={() => handleHover(song)}
                  onClick={() => handleSelect(song)}
                  style={{
                    backgroundColor: isCurrent ? theme.vibrant : "transparent",
                    color: isCurrent ? theme.darkMuted : theme.lightMuted,
                  }}
                >
                  <ImageWithFallback
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
                  {/* <FaPlay className="text-xs opacity-50" /> */}

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      useSongStore.getState().removeFromQueue(song.id);
                    }}
                    title="Remove from queue"
                    className="text-xs text-white/50 hover:text-white"
                  >
                    <TbPlaylistX size={24} className="text-red-600" />
                  </button>
                </li>
              );
            })}
            <hr className="my-2 border-white/10" />
          </>
        )}

        {/* 🧠 PLAYLIST */}
        {displaySongs.length > 0 && (
          <>
            <li
              className="text-sm font-semibold"
              style={{ color: theme.vibrant }}
            >
              Playlist
            </li>
            {displaySongs.map((song) => {
              const isCurrent =
                !queue.length > 0 && currentSong?.id === song.id;
              return (
                <li
                  key={song.id}
                  onMouseEnter={() => handleHover(song)}
                  className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all ${
                    isCurrent
                      ? "shadow-md ring-1 ring-white/30"
                      : "hover:bg-white/10"
                  }`}
                  onClick={() => handleSelect(song)}
                  style={{
                    backgroundColor: isCurrent ? theme.vibrant : "transparent",
                    color: isCurrent ? theme.darkMuted : theme.lightMuted,
                  }}
                >
                  <ImageWithFallback
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
                  {queue.find((s) => s.id === song.id) ? (
                    <CgPlayListCheck size={24} className="text-green-400" />
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        addToQueue(song);
                      }}
                      title="Add to queue"
                      className="text-xs text-white/50 hover:text-white"
                    >
                      <TbPlaylistAdd size={24} />
                    </button>
                  )}
                </li>
              );
            })}
            <hr className="my-2 border-white/10" />
          </>
        )}

        {/* 🚀 SMART AUTOPLAY */}
        {upcomingSongs.length > 0 && (
          <>
            <li
              className="text-sm font-semibold"
              style={{ color: theme.vibrant }}
            >
              Up Next
            </li>
            {upcomingSongs.map((song) => (
              <li
                key={song.id}
                onMouseEnter={() => handleHover(song)}
                className="flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-white/10 transition-all"
                onClick={() => handleSelect(song, true)}
                style={{ color: theme.lightMuted }}
              >
                <ImageWithFallback
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
              </li>
            ))}
          </>
        )}
      </ul>

      {confirmClear && (
        <ConfirmModal
          title="Clear Queue?"
          message="Are you sure you want to remove all songs from your queue?"
          onConfirm={() => {
            useSongStore.getState().clearQueue();
            setConfirmClear(false);
          }}
          onCancel={() => setConfirmClear(false)}
          style={{
            background: isMobile ? theme.darkMuted : theme.muted,
            color: theme.lightMuted,
          }}
        />
      )}
    </aside>
  );
}
