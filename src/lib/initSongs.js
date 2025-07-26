import useSongStore from "@/lib/songStore";
import { useEffect, useState } from "react";

export const useInitSongs = () => {
  const { songs, setSongs } = useSongStore();
  const [isLoading, setIsLoading] = useState(false);

  const fetchSongs = async () => {
    if (isLoading) return; // Prevent multiple calls while fetching
    
    setIsLoading(true); // Start loading
    try {
      const res = await fetch("/api/songs");
      const raw = await res.json();
      const formatted = raw.map((song) => ({
        ...song,
        url: `/api/song?id=${song.id}`,
        cover: song.cover || "/default.png",
      }));

      // Only update if songs actually change
      if (songs.length === 0 || JSON.stringify(songs) !== JSON.stringify(formatted)) {
        setSongs(formatted);
        console.log("updated");
        
      }
    } catch (err) {
      console.error("🚨 Failed to load songs:", err);
    } finally {
      setIsLoading(false); // End loading
    }
  };

  useEffect(() => {
    console.log("sl", songs.length);

    // Fetch songs only if they haven't been loaded yet
    if (songs.length === 0 && !isLoading) {
      fetchSongs();
    }
  }, [songs.length, isLoading]); // Add isLoading as a dependency to avoid re-fetching

  // Add a manual function to update songs if needed (e.g., after song upload)
  const refreshSongs = () => {
    fetchSongs();  // Re-fetch the songs from the API
  };

  return {
    refreshSongs, // Expose this function for later use
  };
};

/* export const useInitSongs = () => {
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
  }, [songs.length]);
};
 */