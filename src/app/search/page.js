"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import useSongStore from "@/lib/songStore";
import { Search } from "lucide-react";
import debounce from "lodash.debounce";
import { motion } from "motion/react";
import ImageWithFallback from "@/lib/imageWithFallback";
import AddToQueueButton from "@/components/AddToQueue";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { setCurrentSong } = useSongStore();

  const fetchResults = async (q) => {
    if (!q.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setResults(data);
    } catch (err) {
      console.error("Search failed:", err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const debouncedSearch = useCallback(debounce(fetchResults, 200), []);

  useEffect(() => {
    debouncedSearch(query);
  }, [query, debouncedSearch]);

  const handleClick = (song) => {
    const tempPlaylistId = "search-result"; // or `search-${Date.now()}` if truly dynamic
    const playlistSongs = [song]; // if it's just 1 song or the search result list

    const { setPlaylist, setCurrentPlaylistId, setCurrentSong } =
      useSongStore.getState();

    setPlaylist(tempPlaylistId, playlistSongs);
    setCurrentPlaylistId(tempPlaylistId);
    setCurrentSong(song);
    router.push(`/player/${song.id}`);
  };

  return (
    <div className="px-4 py-3 max-w-screen-lg mx-auto min-h-[100dvh]">
      <h1 className="text-2xl font-bold text-white mb-6 mt-3">Search</h1>

      <div className="relative w-full max-w-md mb-8">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search songs, artists, albums..."
          className="w-full bg-white/10 text-white focus:outline-none focus:ring-1 focus:ring-rose-500 px-4 py-3 pr-10 rounded-lg placeholder:text-white/50"
        />
        <span className="absolute right-3 top-3 text-white/70 pointer-events-none">
          <Search size={20} />
        </span>
      </div>

      {loading && <p className="text-white/60">Searching...</p>}

      {!loading && results.length === 0 && query && (
        <p className="text-white/40">No results found.</p>
      )}

      <section className=" h-[75dvh] max-w-full overflow-x-hidden overflow-auto">
        {!loading && results.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 mb-32">
            {results.map((song) => (
              <motion.div
                key={song.id}
                onClick={() => handleClick(song)}
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
                className="flex-shrink-0 snap-start w-44 rounded-2xl overflow-hidden relative cursor-pointer group bg-gradient-to-br from-[#1c1c1e] to-[#2c2c2e] shadow-md hover:shadow-xl transition-shadow duration-300"
              >
                <AddToQueueButton song={song} />
                {/* Album Art */}
                <div className="relative aspect-square w-full overflow-hidden">
                  <ImageWithFallback
                    src={song.cover}
                    alt={song.title}
                    width={176}
                    height={176}
                    className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                  />

                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent z-10" />

                  {/* Text overlay */}
                  <div className="absolute bottom-0 left-0 w-full p-3 z-20 text-white">
                    <p
                      className="text-sm font-semibold *truncate whitespace-nowrap"
                      style={{
                        animation:
                          song.title.length > 20
                            ? "scroll-text 10s linear infinite"
                            : "none",
                      }}
                    >
                      {song.title}
                    </p>
                    <p className="text-xs text-white/70 truncate">
                      {song.artist}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
