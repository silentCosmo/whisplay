import { create } from "zustand";
import { persist } from "zustand/middleware";

const useSongStore = create(
  persist(
    (set, get) => ({
      songs: [],
      currentSong: null,
      currentIndex: -1,
      shuffle: false,
      repeat: "all", // values: "all", "one", "none"

      // Setters
      setSongs: (songs) => set({ songs }),
      setShuffle: (val) => set({ shuffle: val }),
      toggleShuffle: () => set((s) => ({ shuffle: !s.shuffle })),
      setRepeat: (mode) => set({ repeat: mode }),
      toggleRepeat: () =>
        set((s) => {
          const next = { all: "one", one: "none", none: "all" };
          return { repeat: next[s.repeat] };
        }),

      setCurrentSong: (song) => {
        const index = get().songs.findIndex((s) => s.id === song.id);
        set({ currentSong: song, currentIndex: index });
      },

      getShuffledSongs: () => {
        const { songs } = get();
        return [...songs].sort(() => Math.random() - 0.5);
      },

      // Playback Controls
      playNext: () => {
        const {
          songs,
          currentIndex,
          shuffle,
          repeat,
          setCurrentSong,
          currentSong,
        } = get();

        if (repeat === "one") {
          // replay the same song
          setCurrentSong(currentSong);
          return;
        }

        if (shuffle) {
          const randomIndex = Math.floor(Math.random() * songs.length);
          setCurrentSong(songs[randomIndex]);
          return;
        }

        let nextIndex = currentIndex + 1;

        if (nextIndex >= songs.length) {
          if (repeat === "all") {
            nextIndex = 0;
          } else {
            return; // no repeat
          }
        }

        setCurrentSong(songs[nextIndex]);
      },

      playPrevious: () => {
        const { songs, currentIndex, setCurrentSong } = get();
        const prevIndex = currentIndex - 1;

        if (prevIndex >= 0) {
          setCurrentSong(songs[prevIndex]);
        } else {
          setCurrentSong(songs[songs.length - 1]); // loop to last
        }
      },
    }),
    {
      name: "song-store", // localStorage key
    }
  )
);

export default useSongStore;
