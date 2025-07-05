import { create } from "zustand";
import { persist } from "zustand/middleware";

/* function shuffleArray(arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
} */

  function shuffleArray(arr, pinnedSong = null) {
  const copy = [...arr];

  // Remove the pinned song if provided
  const filtered = pinnedSong
    ? copy.filter((s) => s.id !== pinnedSong.id)
    : copy;

  // Fisher-Yates shuffle
  for (let i = filtered.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [filtered[i], filtered[j]] = [filtered[j], filtered[i]];
  }

  // Return with pinned song at the front
  return pinnedSong ? [pinnedSong, ...filtered] : filtered;
}


const useSongStore = create(
  persist(
    (set, get) => ({
      //playlists: {}, // { playlistId: [song1, song2, ...], ... }
      playlists: {},
      currentPlaylistId: null,
      currentSong: null,
      currentIndex: -1,
      shuffle: false,
      shuffledSongs: [],
      repeat: "not",
      volume: 1,
      playing: false,
      songs: [], // initial empty array
      setSongs: (songs) => set({ songs }),

      setRepeat: (mode) => set({ repeat: mode }),
      toggleRepeat: () =>
        set((s) => {
          const next = { all: "one", one: "none", none: "all" };
          return { repeat: next[s.repeat] };
        }),

      setPlaylist: (playlistId, songs) => {
        const { shuffle, currentSong } = get();

        set((state) => ({
          playlists: {
            ...state.playlists,
            [playlistId]: songs,
          },
          shuffledSongs: shuffle ? shuffleArray(songs, currentSong) : [],
        }));

        console.log("🎼 Playlist stored:", playlistId, songs.length, "songs");
      },

      setCurrentPlaylistId: (playlistId) =>
        set({ currentPlaylistId: playlistId }),

      // Also getter helper to get current playlist songs
      getCurrentPlaylistSongs: () => {
        const id = get().currentPlaylistId;
        return get().playlists[id] || [];
      },

      toggleShuffle: () => {
  const shuffle = !get().shuffle;
  const { currentPlaylistId, playlists, currentSong } = get();
  const playlist = playlists[currentPlaylistId] || [];

  set({
    shuffle,
    shuffledSongs: shuffle ? shuffleArray(playlist, currentSong) : [],
  });
},



/* generateSmartAutoplay: () => {
  const { currentSong, songs, setPlaylist, setCurrentPlaylistId } = get();

  console.log('smart all', songs);
  

  if (!currentSong || !currentSong.tags?.length) return;

  const similar = songs
    .filter(
      (s) =>
        s.id !== currentSong.id &&
        s.tags?.some((tag) => currentSong.tags.includes(tag))
    )
    .slice(0, 15); // Or however many you want

  const autoplayPlaylist = [currentSong, ...similar];

  const autoplayId = `autoplay-${currentSong.id}`;

  setPlaylist(autoplayId, autoplayPlaylist);
  setCurrentPlaylistId(autoplayId);

  console.log("🔄 Auto-generated playlist based on", currentSong.title);
}, */

generateSmartAutoplayPreview: () => {
  const { currentSong, songs } = get();

  if (!currentSong || !currentSong.tags?.length) return [];

  const similar = songs
    .filter(
      (s) =>
        s.id !== currentSong.id &&
        s.tags?.some((tag) => currentSong.tags.includes(tag))
    )
    .slice(0, 10);

  return similar;
},
generateSmartAutoplay: () => {
  const {
    currentSong,
    songs,
    setPlaylist,
    setCurrentPlaylistId,
  } = get();

  if (!currentSong || !currentSong.tags?.length) return;

  // Match songs with at least one shared tag
  const similar = songs
    .filter(
      (s) =>
        s.id !== currentSong.id &&
        s.tags?.some((tag) => currentSong.tags.includes(tag))
    )
    .slice(0, 15);

  if (similar.length === 0) {
    console.warn("⚠️ No similar songs found for autoplay. Skipping...");
    return;
  }

  const autoplayPlaylist = [currentSong, ...similar];
  const autoplayId = `autoplay-${currentSong.id}`;

  setPlaylist(autoplayId, autoplayPlaylist);
  setCurrentPlaylistId(autoplayId);

  console.log(`🔄 Auto-generated playlist with ${autoplayPlaylist.length} songs based on "${currentSong.title}"`);
},


      // Create or update a playlist
      /* setPlaylist: (id, songs) =>
        set((state) => ({
          playlists: { ...state.playlists, [id]: songs },
        })), */

      // Set the current playlist ID and reset related state
      /* setCurrentPlaylistId: (id) => {
        const playlist = get().playlists[id] || [];
        set({
          currentPlaylistId: id,
          shuffledSongs: get().shuffle ? shuffleArray(playlist) : [],
          currentIndex: -1,
          currentSong: null,
        });
      }, */

      // Set the current song by id and set currentIndex within the current playlist
      setCurrentSong: (song) => {
        const playlistId = get().currentPlaylistId;
        const playlist = get().playlists[playlistId] || [];
        const list = get().shuffle ? get().shuffledSongs : playlist;
        const index = list.findIndex((s) => s.id === song.id);

        if (index === -1) {
          // Song not found in current playlist — optional fallback?
          return;
        }

        if (typeof document !== "undefined") {
  document.cookie = `last-played-song=${song.id}; path=/`;
}


        set({ currentSong: song, currentIndex: index });
      },

      getShuffledSongs: () => {
        const { currentPlaylistId, playlists } = get();
        const playlist = playlists?.[currentPlaylistId] || [];
        return shuffleArray(playlist);
      },

      /* toggleShuffle: () => {
        const shuffle = !get().shuffle;
        const playlistId = get().currentPlaylistId;
        const playlist = get().playlists[playlistId] || [];

        set({
          shuffle,
          shuffledSongs: shuffle ? shuffleArray(playlist) : [],
        });
      }, */

      playNext: () => {
        const {
          playlists,
          currentPlaylistId,
          currentIndex,
          shuffle,
          shuffledSongs,
          repeat,
          setCurrentSong,
        } = get();

        const playlist = playlists[currentPlaylistId] || [];
        const list = shuffle ? shuffledSongs : playlist;

        if (!list.length) return;

        let nextIndex = currentIndex + 1;

        /* if (nextIndex >= list.length) {
          if (repeat === "all") nextIndex = 0;
          else return;
        } */

          if (nextIndex >= list.length) {
  if (repeat === "all") {
    nextIndex = 0;
  } else {
    // 💡 Trigger Smart Autoplay instead of stopping
    get().generateSmartAutoplay();
    return;
  }
}


        const nextSong = list[nextIndex];
        set({ currentIndex: nextIndex, currentSong: nextSong });
        setCurrentSong(nextSong);
        set({
          currentTime: 0,
          progress: 0,
          duration: 0,
        });
      },

      playPrevious: () => {
        const {
          playlists,
          currentPlaylistId,
          currentIndex,
          shuffle,
          shuffledSongs,
          setCurrentSong,
        } = get();

        const playlist = playlists[currentPlaylistId] || [];
        const list = shuffle ? shuffledSongs : playlist;

        if (!list.length) return;

        let prevIndex = currentIndex - 1;
        if (prevIndex < 0) prevIndex = list.length - 1;

        set({ currentIndex: prevIndex, currentSong: list[prevIndex] });
        setCurrentSong(list[prevIndex]);
        set({
          currentTime: 0,
          progress: 0,
          duration: 0,
        });
      },

      // Volume & playback controls (unchanged)
      setVolume: (val) => {
        const ref = get().audioRef;
        if (ref) ref.volume = val;
        set({ volume: val });
      },
      setAudioRef: (ref) => {
        const volume = get().volume;
        if (ref) ref.volume = volume;
        set({ audioRef: ref });
      },
      togglePlay: () => {
        const { audioRef, playing, setPlaying } = get();
        if (!audioRef) return;
        if (playing) {
          audioRef.pause();
          setPlaying(false);
        } else {
          audioRef.play();
          setPlaying(true);
        }
      },
      setPlaying: (val) => set({ playing: val }),
      setCurrentTime: (time) => set({ currentTime: time }),
      setDuration: (val) => set({ duration: val }),
      setProgress: (val) => set({ progress: val }),
      seekTo: (time) => {
        const { audioRef } = get();
        if (audioRef) audioRef.currentTime = time;
      },
    }),
    {
      name: "song-store",
      partialize: (state) => ({
        playlists: state.playlists,
        currentPlaylistId: state.currentPlaylistId,
        currentSong: state.currentSong,
        currentIndex: state.currentIndex,
        shuffle: state.shuffle,
        shuffledSongs: state.shuffledSongs,
        repeat: state.repeat,
        playing: state.playing,
        volume: state.volume,
        songs: state.songs,
      }),
    }
  )
);

export default useSongStore;
