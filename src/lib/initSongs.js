import useSongStore from "@/lib/songStore";
import { useEffect } from "react";

export const useInitSongs = () => {
  const { songs, setSongs } = useSongStore();

  useEffect(() => {
    const loadSongs = async () => {
      if (songs.length === 0) {
        try {
          const res = await fetch("/api/songs");
          const raw = await res.json();
          const formatted = raw.map((song) => ({
            ...song,
            url: `/api/song?id=${song.id}`,
            cover: song.cover || "/default.png",
          }));
          setSongs(formatted);
        } catch (err) {
          console.error("🚨 Failed to load songs:", err);
        }
      }
    };

    loadSongs();
  }, []);
};
