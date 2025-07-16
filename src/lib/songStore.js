import { create } from "zustand";
import { persist } from "zustand/middleware";

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
      songs: [],
      queue: [],
      playlists: {},
      currentPlaylistId: null,
      currentSong: null,
      currentIndex: -1,
      shuffle: false,
      shuffledSongs: [],
      repeat: "not",
      volume: 1,
      playing: false,
      isBuffering: false,
      setIsBuffering: (val) => set({ isBuffering: val }),
      queueIndex: 0,
      setQueueIndex: (index) => set({ queueIndex: index }),

      setSongs: (songs) => set({ songs }),

      setRepeat: (mode) => set({ repeat: mode }),
      toggleRepeat: () =>
        set((s) => {
          const next = { all: "one", one: "none", none: "all" };
          return { repeat: next[s.repeat] };
        }),

      addToQueue: (song) => {
        set((state) => ({
          queue: [...state.queue, song],
          queueIndex: state.queue.length === 0 ? 0 : state.queueIndex,
        }));
        console.log("added to quee:", song);
      },
      removeFromQueue: (id) => {
        const queue = get().queue.filter((s) => s.id !== id);
        set({ queue });
      },
      clearQueue: () => set({ queue: [], queueIndex: 0 }),

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
        const { currentSong, songs, setPlaylist, setCurrentPlaylistId } = get();

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

        console.log(
          `🔄 Auto-generated playlist with ${autoplayPlaylist.length} songs based on "${currentSong.title}"`
        );
      },

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

      /* playNext: () => {
        const {
          queue,
          playlists,
          currentPlaylistId,
          currentIndex,
          shuffle,
          shuffledSongs,
          repeat,
          setCurrentSong,
        } = get();

        if (queue.length > 0) {
          const [nextFromQueue, ...rest] = queue;
          set({ queue: rest });
          setCurrentSong(nextFromQueue);
          return;
        }

        const playlist = playlists[currentPlaylistId] || [];
        const list = shuffle ? shuffledSongs : playlist;

        
        
        if (!list.length) return;
        
        let nextIndex = currentIndex + 1;
        console.log("next", nextIndex);

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
      }, */

      playNext: () => {
        const {
          queue,
          playlists,
          currentPlaylistId,
          currentIndex,
          shuffle,
          shuffledSongs,
          repeat,
          setCurrentSong,
          setPlaylist,
          queuedToBeRemoved,
          setCurrentPlaylistId,
          getCurrentPlaylistSongs,
          generateSmartAutoplayPreview,
        } = get();

        /* let workingQueue = [...queue];

  if (queuedToBeRemoved) {
    workingQueue = workingQueue.filter((song) => song.id !== queuedToBeRemoved);
    set({ queuedToBeRemoved: null, queue: workingQueue });
  }

  // 👇 Proceed as usual
  if (workingQueue.length > 0) {
    const [nextFromQueue, ...rest] = workingQueue;
    set({ queue: rest });
    setCurrentSong(nextFromQueue);
    set({ queuedToBeRemoved: nextFromQueue.id });
    return;
  } */

        if (queue.length > 0) {
          const { queueIndex } = get();
          const nextFromQueue = queue[queueIndex];
          if (!nextFromQueue) {
            // No more queue, fallback to playlist or autoplay
            // ...
            return;
          }
          set({ queueIndex: queueIndex + 1 });
          setCurrentSong(nextFromQueue);
          return;
        }

        // 2. Get playlist
        const playlist = playlists[currentPlaylistId] || [];
        const list = shuffle ? shuffledSongs : playlist;

        // 3. Nothing to play
        if (!list.length) return;

        let nextIndex = currentIndex + 1;

        // 4. End of playlist reached
        if (nextIndex >= list.length) {
          if (repeat === "all") {
            nextIndex = 0;
          } else {
            // 5. Generate new autoplay playlist and play it
            const fallback =
              generateSmartAutoplayPreview?.(get().currentSong) || [];

            if (fallback.length > 0) {
              const autoplayId = `autoplay-${Date.now()}`;
              const newPlaylist = [get().currentSong, ...fallback];

              setPlaylist(autoplayId, newPlaylist);
              setCurrentPlaylistId(autoplayId);
              set({ currentIndex: 0 });
              setCurrentSong(newPlaylist[1]); // Skip current song
              return;
            }

            return; // no fallback
          }
        }

        // 6. Normal next song flow
        const nextSong = list[nextIndex];
        set({ currentIndex: nextIndex });
        setCurrentSong(nextSong);
        set({
          currentTime: 0,
          progress: 0,
          duration: 0,
        });
      },
      /* playPrevious: () => {
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
      }, */

      playPrevious: () => {
        const {
          queue,
          playlists,
          currentPlaylistId,
          currentIndex,
          currentSong,
          shuffle,
          shuffledSongs,
          setCurrentSong,
          getCurrentPlaylistSongs,
        } = get();

        const playlist = getCurrentPlaylistSongs?.() || [];
        const list = shuffle ? shuffledSongs : playlist;

        // 💡 Try to find previous in current queue first
        const { queueIndex } = get();
        if (queue.length > 0 && queueIndex > 1) {
          const prevInQueue = queue[queueIndex - 2];
          set({ queueIndex: queueIndex - 1 });
          setCurrentSong(prevInQueue);
          return;
        }

        // 🔄 Fallback to playlist navigation
        if (!list.length) return;

        let prevIndex = currentIndex - 1;
        if (prevIndex < 0) prevIndex = list.length - 1;

        const prevInPlaylist = list[prevIndex];
        set({ currentIndex: prevIndex });
        setCurrentSong(prevInPlaylist);
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
        queue: state.queue,
      }),
    }
  )
);

export default useSongStore;
