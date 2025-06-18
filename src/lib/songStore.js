// lib/songStore.js
import { create } from "zustand";

const useSongStore = create((set) => ({
  playlist: [],
  currentIndex: 0,
  currentSong: null,

  setPlaylist: (list) => set({ playlist: list }),
  setCurrentSong: (song, index) =>
    set({ currentSong: song, currentIndex: index }),

  nextSong: () =>
    set((state) => {
      const nextIndex = (state.currentIndex + 1) % state.playlist.length;
      return {
        currentIndex: nextIndex,
        currentSong: state.playlist[nextIndex],
      };
    }),

  prevSong: () =>
    set((state) => {
      const prevIndex =
        (state.currentIndex - 1 + state.playlist.length) %
        state.playlist.length;
      return {
        currentIndex: prevIndex,
        currentSong: state.playlist[prevIndex],
      };
    }),
}));

export default useSongStore;
