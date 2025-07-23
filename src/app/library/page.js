"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  Music,
  Radio,
  BookText,
  Folder,
} from "lucide-react";
import useSongStore from "@/lib/songStore";
import PlaylistGrid from "@/components/library/PlaylistGrid";
import LibraryStats from "@/components/LibraryStatus";

export default function Library() {
  const [songs, setSongs] = useState([]);
  const router = useRouter();
  const { setSongs: setGlobalSongs } = useSongStore();

  useEffect(() => {
    const fetchSongs = async () => {
      try {
        const res = await fetch("/api/songs");
        const rawSongs = await res.json();

        const formatted = rawSongs.map((song) => ({
          ...song,
          url: `/api/song?id=${song.id}`,
          cover: song.cover || "/default.png",
        }));

        setSongs(formatted);
        setGlobalSongs(formatted);
      } catch (err) {
        console.error("💥 Failed to fetch songs:", err);
      }
    };

    fetchSongs();
  }, []);

  const doors = [
    {
      icon: <User size={24} />,
      label: "Artists",
      href: "/library/artists",
    },
    {
      icon: <Music size={24} />,
      label: "Albums",
      href: "/library/albums",
    },
    {
      icon: <Radio size={24} />,
      label: "Live Radio",
      href: "/library/radio",
    },
    {
      icon: <BookText size={24} />,
      label: "Mini Audiobooks",
      href: "/library/audiobooks",
    },
  ];

  return (
    <div className="p-6 space-y-8 min-h-[85dvh]">
      <h2 className="text-xl font-semibold text-white mb-6">Your Library</h2>

      <LibraryStats/>

      {/* Doors Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-5">
        {doors.map(({ icon, label, href }) => (
          <div
            key={label}
            onClick={() => router.push(href)}
            className="cursor-pointer bg-white/5 hover:bg-white/10 backdrop-blur-lg rounded-xl p-5 flex flex-col items-center justify-center text-center text-white shadow transition"
          >
            <div className="mb-3">{icon}</div>
            <p className="font-medium text-sm">{label}</p>
          </div>
        ))}
      </div>

      {/* Playlist Component */}
      <PlaylistGrid />
    </div>
  );
}
