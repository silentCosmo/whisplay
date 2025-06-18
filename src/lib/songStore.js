// lib/songStore.js
import { create } from "zustand";

const useSongStore = create((set) => ({
  currentSong: null,
  setCurrentSong: (song) => set({ currentSong: song }),
}));

export default useSongStore;
