"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { FaSearch, FaSortAlphaDown, FaSortAlphaUpAlt } from "react-icons/fa";
import useSongStore from "@/lib/songStore";
import debounce from "lodash.debounce";

export default function Library() {
  const [songs, setSongs] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [query, setQuery] = useState("");
  const [sortAsc, setSortAsc] = useState(true);
  const audioRef = useRef(null);
  const router = useRouter();
  const { setCurrentSong, setSongs: setGlobalSongs } = useSongStore();

  useEffect(() => {
    const fetchSongs = async () => {
      try {
        const res = await fetch("/api/songs");
        const rawSongs = await res.json();

        const formattedSongs = rawSongs.map((song) => ({
          ...song,
          url: `/api/song?id=${song.id}`,
          cover: song.cover || "/default.png",
        }));

        setSongs(formattedSongs);
        setFiltered(formattedSongs);
        setGlobalSongs(formattedSongs);
      } catch (err) {
        console.error("💥 Failed to fetch songs:", err);
      }
    };

    fetchSongs();
  }, []);

  const handleHover = (song) => {
    fetch(`/api/song?id=${song.id}`, { method: "HEAD" }).catch((err) =>
      console.warn("Hover prewarm failed:", err)
    );
    if (audioRef.current) {
      audioRef.current.src = song.url;
      audioRef.current.play().catch(() => {});
    }
  };

  const handleLeave = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };

  const handleClick = (song) => {
    setCurrentSong(song);
    router.push(`/player/${song.id}`);
  };

  const debouncedSearch = useRef(
    debounce((q) => {
      const qLower = q.toLowerCase();
      const results = songs.filter(
        (s) =>
          s.title.toLowerCase().includes(qLower) ||
          s.artist.toLowerCase().includes(qLower)
      );
      setFiltered(results);
    }, 200)
  ).current;

  useEffect(() => {
    debouncedSearch(query);
  }, [query]);

  const toggleSort = () => {
    setSortAsc((prev) => !prev);
    setFiltered((prev) =>
      [...prev].sort((a, b) =>
        sortAsc
          ? a.title.localeCompare(b.title)
          : b.title.localeCompare(a.title)
      )
    );
  };

  return (
    <div className="p-6">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
        <div className="relative w-full sm:w-96">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search songs, artists..."
            className="w-full bg-white/10 text-white px-4 py-2 pr-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 transition"
          />
          <FaSearch className="absolute right-3 top-3 text-white/60" />
        </div>
        <button
          onClick={toggleSort}
          className="flex items-center gap-2 px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition"
        >
          {sortAsc ? <FaSortAlphaDown /> : <FaSortAlphaUpAlt />}
          <span className="text-sm">Sort by Title</span>
        </button>
      </div>

      {/* Song Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-5">
        {filtered.map((song) => (
          <div
            key={song.id}
            onClick={() => handleClick(song)}
            onMouseEnter={() => handleHover(song)}
            onMouseLeave={handleLeave}
            className="group cursor-pointer bg-white/5 backdrop-blur-lg rounded-xl overflow-hidden shadow-md hover:scale-105 transition transform duration-300"
          >
            <div className="relative h-40 w-full">
              <Image
                src={song.cover}
                fill
                alt={song.title}
                className="object-cover transition-opacity duration-300 group-hover:opacity-80"
              />
              <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition" />
            </div>
            <div className="p-3">
              <h3 className="text-white font-semibold truncate">
                {song.title}
              </h3>
              <p className="text-sm text-white/70 truncate">{song.artist}</p>
            </div>
          </div>
        ))}
      </div>

      <audio ref={audioRef} />
    </div>
  );
}
