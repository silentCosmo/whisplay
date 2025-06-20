import { create } from "zustand";
import { persist } from "zustand/middleware";

function shuffleArray(arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

const useSongStore = create(
  persist(
    (set, get) => ({
      songs: [],
      shuffledSongs: [],
      currentSong: null,
      currentIndex: -1,
      shuffle: false,
      repeat: "all", // "all", "one", "none"

      // Setters
      /* setSongs: (songs) => {
        const shuffle = get().shuffle;
        set({
          songs,
          shuffledSongs: shuffle ? shuffleArray(songs) : [],
        });
      }, */

      setSongs: (songs) => {
        set({
          songs,
          shuffledSongs: [],
        });
      },

      setShuffle: (val) => {
        const { songs } = get();
        set({
          shuffle: val,
          shuffledSongs: val ? shuffleArray(songs) : [],
        });
      },

      toggleShuffle: () => {
        const { shuffle, songs } = get();
        if (!shuffle) {
          // Turning shuffle ON
          set({
            shuffle: true,
            shuffledSongs: shuffleArray(songs),
          });
        } else {
          // Turning shuffle OFF
          set({
            shuffle: false,
            shuffledSongs: [],
          });
        }
      },

      /* toggleShuffle: () => {
        const { shuffle, songs } = get();
        set({
          shuffle: !shuffle,
          shuffledSongs: !shuffle ? shuffleArray(songs) : [],
        });
      }, */

      setRepeat: (mode) => set({ repeat: mode }),
      toggleRepeat: () =>
        set((s) => {
          const next = { all: "one", one: "none", none: "all" };
          return { repeat: next[s.repeat] };
        }),

      setCurrentSong: (song) => {
        const list = get().shuffle ? get().shuffledSongs : get().songs;
        const index = list.findIndex((s) => s.id === song.id);
        set({ currentSong: song, currentIndex: index });
      },

      getShuffledSongs: () => get().shuffledSongs,

      /* playNext: () => {
        const {
          songs,
          currentIndex,
          shuffle,
          repeat,
          setCurrentSong,
          currentSong,
        } = get();

        const list = shuffle ? shuffledSongs : songs;

        if (repeat === "one") {
          setCurrentSong(currentSong);
          return;
        }

        let nextIndex = currentIndex + 1;

        if (nextIndex >= list.length) {
          if (repeat === "all") {
            nextIndex = 0;
          } else {
            return; // no repeat
          }
        }

        set({ currentIndex: nextIndex, currentSong: list[nextIndex] });
      }, */

      playNext: () => {
        const {
          songs,
          currentIndex,
          shuffle,
          repeat,
          setCurrentSong,
          currentSong,
        } = get();

        // Only repeat the same song when it ends naturally
        // Not when user presses "Next"
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
            return; // no repeat, stop at end
          }
        }

        setCurrentSong(songs[nextIndex]);
      },

      playPrevious: () => {
        const { songs, shuffledSongs, currentIndex, shuffle, setCurrentSong } =
          get();

        const list = shuffle ? shuffledSongs : songs;
        let prevIndex = currentIndex - 1;

        if (prevIndex < 0) {
          prevIndex = list.length - 1;
        }

        set({ currentIndex: prevIndex, currentSong: list[prevIndex] });
      },
    }),
    {
      name: "song-store",
    }
  )
);

export default useSongStore;
