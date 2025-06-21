"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import useSongStore from "@/lib/songStore";

export default function Library() {
  const [songs, setSongs] = useState([]);
  const router = useRouter();
  const { setCurrentSong, setSongs: setGlobalSongs } = useSongStore();

  useEffect(() => {
    const fetchSongs = async () => {
      try {
        const res = await fetch("/api/songs"); // From MongoDB
        const rawSongs = await res.json();

        // Build songs with dynamic url
        const formattedSongs = rawSongs.map((song) => ({
          ...song,
          url: `/api/song?id=${song.id}`, // Don't store this in DB
          cover: song.cover || "/default.png", // fallback
        }));

        setSongs(formattedSongs); // For this UI
        setGlobalSongs(formattedSongs); // For global store
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
  };

  return (
    <div className="p-6 grid grid-cols-2 md:grid-cols-3 gap-4">
      {songs.map((song) => (
        <div
          onMouseEnter={() => handleHover(song)}
          key={song.id}
          onClick={() => {
            setCurrentSong(song);
            router.push(`/player/${song.id}`);
          }}
          className="cursor-pointer bg-white/10 p-4 rounded-lg shadow hover:scale-105 transition"
        >
          <Image
            height={400}
            width={400}
            src={song.cover || "/default.png"}
            className="rounded mb-2 w-full h-40 object-cover"
            alt={song.title}
          />
          <h3 className="font-bold truncate">{song.title}</h3>
          <p className="text-pinky text-sm">{song.artist}</p>
        </div>
      ))}
    </div>
  );
}
