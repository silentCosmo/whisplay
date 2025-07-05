"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import useSongStore from "@/lib/songStore";
import { Search } from "lucide-react";
import debounce from "lodash.debounce";

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
    <div className="p-6 max-w-screen-lg mx-auto min-h-[100dvh]">
      <h1 className="text-3xl font-bold text-white mb-6">Search</h1>

      <div className="relative w-full max-w-md mb-10">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search songs, artists, albums..."
          className="w-full bg-white/10 text-white px-4 py-3 pr-10 rounded-lg focus:outline-none focus:ring-1 focus:ring-pink-500 placeholder:text-white/50"
        />
        <span className="absolute right-3 top-3 text-white/70 pointer-events-none">
          <Search size={20} />
        </span>
      </div>

      {loading && <p className="text-white/60">Searching...</p>}

      {!loading && results.length === 0 && query && (
        <p className="text-white/40">No results found.</p>
      )}

      {!loading && results.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
          {results.map((song) => (
            <div
              key={song.id}
              onClick={() => handleClick(song)}
              className="cursor-pointer rounded-xl overflow-hidden bg-white/5 backdrop-blur-md shadow hover:shadow-lg hover:scale-[1.02] transition"
            >
              <div className="relative w-full aspect-square">
                <Image
                  src={song.cover || "/default.png"}
                  alt={song.title}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-3">
                <p className="text-white font-medium truncate">{song.title}</p>
                <p className="text-sm text-neutral-400 truncate">
                  {song.artist}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
