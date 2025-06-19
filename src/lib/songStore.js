import { create } from "zustand";
import { persist } from "zustand/middleware";

const useSongStore = create(
  persist(
    (set, get) => ({
      songs: [],
      currentSong: null,
      currentIndex: -1,

      setSongs: (songs) => set({ songs }),

      setCurrentSong: (song) => {
        const index = get().songs.findIndex((s) => s.id === song.id);
        set({ currentSong: song, currentIndex: index });
      },

      playNext: () => {
        const { songs, currentIndex, setCurrentSong } = get();
        const nextIndex = currentIndex + 1;
        if (songs[nextIndex]) {
          setCurrentSong(songs[nextIndex]);
        }
      },

      playPrevious: () => {
        const { songs, currentIndex, setCurrentSong } = get();
        const prevIndex = currentIndex - 1;
        if (songs[prevIndex]) {
          setCurrentSong(songs[prevIndex]);
        }
      },
    }),
    {
      name: "song-store", // localStorage key
    }
  )
);

export default useSongStore;
