"use client";

import ImageWithFallback from "@/lib/imageWithFallback";
import useSongStore from "@/lib/songStore";
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
    shuffledSongs,
    getCurrentPlaylistSongs,
  } = useSongStore();

  //const displaySongs = shuffle ? shuffledSongs : getCurrentPlaylistSongs();

  const playlistSongs = getCurrentPlaylistSongs?.() || [];
  const displaySongs = shuffle ? shuffledSongs : playlistSongs;
  const upcomingSongs = useSongStore.getState().generateSmartAutoplayPreview?.() || [];
  /* const upcomingSongs = playlistSongs.length <= 1
  ? useSongStore.getState().generateSmartAutoplayPreview?.() || []
  : []; */
  
  /* const upcomingSongs = displaySongs.length <= 1
    ? useSongStore.getState().generateSmartAutoplayPreview?.() || []
    : []; */

  /* if (!displaySongs || !displaySongs.length) {
    return (
      <aside className="p-4">
        <p className="text-sm text-center">No playlist loaded.</p>
      </aside>
    );
  } */

  /* const handleSelect = (song) => {
    console.log("plp:",song);
    
    setCurrentSong(song);
    if (isMobile && onClose) onClose(); // close drawer on mobile
  }; */

  const handleSelect = (song, isFromAutoplay = false) => {
  if (isFromAutoplay) {
    const { generateSmartAutoplay } = useSongStore.getState();
    generateSmartAutoplay(song); // 👈 generate based on this song
  }

  setCurrentSong(song);
  useSongStore .getState().setPlaying(true);
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
        {/* <h2 className="text-lg font-semibold" style={{ color: theme.vibrant }}>
          Playlist
        </h2> */}
        <h2 className="text-lg font-semibold" style={{ color: theme.vibrant }}>
          {playlistSongs.length <= 1 ? "Now Playing" : "Playlist"}
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
              onMouseEnter={() => handleHover(song)}
              className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all ${
                active ? "shadow-md ring-1 ring-white/30" : "hover:bg-white/10"
              }`}
              onClick={() => handleSelect(song)}
              style={{
                backgroundColor: active ? theme.vibrant : "transparent",
                color: active ? theme.darkMuted : theme.lightMuted,
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
              {active && <FaPlay className="text-xs" />}
            </li>
          );
        })}
        {upcomingSongs.length > 0 && (
  <li className="mt-6 mb-2 text-sm font-semibold opacity-80" style={{ color: theme.vibrant }}>
    Up Next
  </li>
)}

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

      </ul>
    </aside>
  );
}
