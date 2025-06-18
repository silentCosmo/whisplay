// app/player/[id]/page.js

"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { parseBlob } from "music-metadata-browser";

export default function PlayerPage() {
  const { id } = useParams();
  const [meta, setMeta] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);

  useEffect(() => {
    const fetchMeta = async () => {
      const url = `/api/song?id=${id}`;
      setAudioUrl(url); // Set audio src

      const blob = await fetch(url).then((res) => res.blob());
      const metadata = await parseBlob(blob);

      const pic = metadata.common.picture?.[0];
      const cover = pic
        ? URL.createObjectURL(new Blob([pic.data]))
        : "/default.jpg";

      setMeta({
        title: metadata.common.title || "Unknown Title",
        artist: metadata.common.artist || "Unknown Artist",
        album: metadata.common.album || "Unknown Album",
        cover,
      });
    };

    fetchMeta();
  }, [id]);

  if (!meta) {
    return (
      <div className="p-6 text-center text-pinky text-xl">Loading Whisplay magic...</div>
    );
  }

  return (
    <div className="p-6 flex flex-col items-center">
      <img
        src={meta.cover}
        className="w-64 h-64 object-cover rounded-2xl shadow mb-4"
        alt="Cover"
      />
      <h1 className="text-2xl font-bold">{meta.title}</h1>
      <p className="text-pink-300 text-md">{meta.artist}</p>
      <p className="text-pink-400 text-sm italic mb-4">{meta.album}</p>

      <audio controls autoPlay src={audioUrl} className="w-full max-w-xl mt-4" />
    </div>
  );
}
