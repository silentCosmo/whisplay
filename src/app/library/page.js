"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import useSongStore from "@/lib/songStore";


export default function Library() {
  const [songs, setSongs] = useState([]);
  const router = useRouter();
  const {setCurrentSong} = useSongStore()

  useEffect(() => {
    const fetchFiles = async () => {
      const res = await fetch("/api/drive/list");
      const files = await res.json();

      // Show placeholders first for fast UI
      setSongs(
        files.map((file) => ({
          id: file.id,
          title: file.name.replace(/\.[^/.]+$/, ""),
          artist: "Loading...",
          cover: "/loading.jpg",
        }))
      );

      // Load each meta individually
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        try {
          const metaRes = await fetch(`/api/meta/${file.id}`);
          const meta = await metaRes.json();

          console.log(meta);

          const cover = meta.cover
            ? `/api/cover/${meta.id}` // 🔁 use proxy route
            : null;

          setSongs((prev) => {
            const updated = [...prev];
            updated[i] = {
              id: file.id,
              title: meta.title || file.name.replace(/\.[^/.]+$/, ""),
              artist: meta.artist || "Unknown",
              cover, // could be null
            };
            return updated;
          });
        } catch (err) {
          console.warn("⚠️ Failed to load meta for", file.name, err);
        }

        await new Promise((r) => setTimeout(r, 50)); // gentle async load
      }
    };

    fetchFiles();
  }, []);

  return (
    <div className="p-6 grid grid-cols-2 md:grid-cols-3 gap-4">
      {songs.map((song) => (
        <div
          key={song.id}
          //onClick={() => router.push(`/player/${song.id}`)}
          onClick={() => {
            setCurrentSong(song);
            router.push(`/player/${song.id}`);
          }}
          className="cursor-pointer bg-white/10 p-4 rounded-lg shadow hover:scale-105 transition"
        >
          <Image
            height={400}
            width={400}
            src={song.cover || "/default.png"} // 🧠 fallback if null
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
