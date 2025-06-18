"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Library() {
  const [songs, setSongs] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const fetchFiles = async () => {
      const res = await fetch("/api/drive/list");
      const files = await res.json();

      // Just show placeholder cards first
      setSongs(files.map(file => ({
        id: file.id,
        title: file.name.replace(/\.[^/.]+$/, ""),
        artist: "Loading...",
        cover: "/loading.jpg",
      })));

      // Now update each song gently
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        try {
          const metaRes = await fetch(`/api/meta/${file.id}`);
          const meta = await metaRes.json();

          setSongs(prev => {
            const updated = [...prev];
            updated[i] = {
              id: file.id,
              title: meta.title || file.name.replace(/\.[^/.]+$/, ""),
              artist: meta.artist || "Unknown",
              cover: meta.cover || "/default.jpg",
            };
            return updated;
          });
        } catch (err) {
          console.warn("⚠️ Failed to load meta for", file.name);
        }
        await new Promise(r => setTimeout(r, 50)); // small delay between fetches
      }
    };

    fetchFiles();
  }, []);

  return (
    <div className="p-6 grid grid-cols-2 md:grid-cols-3 gap-4">
      {songs.map((song) => (
        <div
          key={song.id}
          onClick={() => router.push(`/player/${song.id}`)}
          className="cursor-pointer bg-white/10 p-4 rounded-lg shadow hover:scale-105 transition"
        >
          <img
            src={song.cover}
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
