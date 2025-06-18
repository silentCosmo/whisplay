"use client";

import { useRouter } from "next/navigation";

export default function PlayerClient({ id, songUrl }) {
  const router = useRouter();

  return (
    <div className="min-h-screen p-8 flex flex-col items-center justify-center text-center bg-gradient-to-b from-black via-zinc-900 to-zinc-800 text-white">
      <div className="w-full max-w-md">
        <img
          src="/default.jpg"
          alt="Album Cover"
          className="rounded-xl shadow-lg w-full h-64 object-cover mb-6"
        />
        <h1 className="text-2xl font-bold mb-2">Now Playing</h1>
        <p className="text-xl mb-4">{decodeURIComponent(id)}</p>

        <audio src={songUrl} controls autoPlay className="w-full mb-4" />

        <button
          onClick={() => router.back()}
          className="text-sm bg-white/10 hover:bg-white/20 px-4 py-2 rounded mt-4 transition"
        >
          ← Back to Library
        </button>
      </div>
    </div>
  );
}
