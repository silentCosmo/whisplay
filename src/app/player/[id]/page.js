"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import useSongStore from "@/lib/songStore";

export default function PlayerPage() {
  const { id } = useParams();
  const { currentSong } = useSongStore();

  const [meta, setMeta] = useState({
    title: "Loading title...",
    artist: "Loading artist...",
    album: "Loading album...",
    cover: "/loading.jpg",
  });
  const [audioUrl, setAudioUrl] = useState(null);
  const [coverReady, setCoverReady] = useState(false);

  useEffect(() => {
    setAudioUrl(`/api/song?id=${id}`);

    const loadMeta = async () => {
      let data = currentSong;

      if (!data || data.id !== id) {
        // fallback if user reloads directly on /player/:id
        try {
          const res = await fetch(`/api/meta/${id}`);
          data = await res.json();
        } catch (err) {
          console.error("Meta fetch failed:", err);
        }
      }

      const coverUrl = data?.cover
        ? `/api/cover/${id}`
        : "/default.png";

      const img = new Image();
      img.src = coverUrl;

      img.onload = () => {
        setMeta({
          title: data?.title || "Unknown Title",
          artist: data?.artist || "Unknown Artist",
          album: data?.album || "Unknown Album",
          cover: coverUrl,
        });
        setCoverReady(true);
      };

      img.onerror = () => {
        setMeta((prev) => ({
          ...prev,
          cover: "/default.png",
        }));
        setCoverReady(true);
      };
    };

    loadMeta();
  }, [id, currentSong]);

  return (
    <div className="p-6 flex flex-col items-center transition-all duration-300">
      <div className="relative w-64 h-64 mb-4">
        <img
          src={meta.cover}
          className={`w-full h-full object-cover rounded-2xl shadow transition-opacity duration-500 ${
            coverReady ? "opacity-100" : "opacity-50 blur"
          }`}
          alt="Cover"
        />
      </div>

      <h1 className={`text-2xl font-bold ${!coverReady ? "animate-pulse" : ""}`}>
        {meta.title}
      </h1>
      <p className="text-pink-300 text-md">{meta.artist}</p>
      <p className="text-pink-400 text-sm italic mb-4">{meta.album}</p>

      {audioUrl ? (
        <audio
          controls
          autoPlay
          src={audioUrl}
          className="w-full max-w-xl mt-4"
        />
      ) : (
        <p className="text-pinky text-sm mt-4">Loading audio...</p>
      )}
    </div>
  );
}
