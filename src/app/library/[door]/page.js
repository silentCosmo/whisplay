"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import { BookText, Music, Radio, User } from "lucide-react";
import usePersistentState from "@/lib/usePersistentState";

export default function LibraryDoorPage() {
  const pathname = usePathname();
  const door = pathname?.split("/").pop();

  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);

  const [playlists] = usePersistentState("userPlaylists", []);

  useEffect(() => {
    async function fetchSongs() {
      let userSongs = [];
      if (playlists.length > 0) {
        userSongs = playlists.flatMap((pl) => pl.songs || []);
      }

      if (userSongs.length > 0) {
        setSongs(userSongs);
        setLoading(false);
      } else {
        try {
          const res = await fetch("/api/songs");
          const data = await res.json();
          setSongs(data);
          setLoading(false);
        } catch (error) {
          console.error("Failed to load songs:", error);
          setSongs([]);
          setLoading(false);
        }
      }
    }

    if (door === "artists" || door === "albums") {
      fetchSongs();
    } else {
      setLoading(false);
    }
  }, [door, playlists]);

  const groupSongsBy = (key) => {
    const groups = {};
    songs.forEach((song) => {
      const groupKey = song[key] || "Unknown";
      if (!groups[groupKey]) groups[groupKey] = [];
      groups[groupKey].push(song);
    });
    return groups;
  };

  if (loading) {
    return (
      <div className="p-6 text-white text-center flex items-center justify-center min-h-[93dvh]">Loading {door}...</div>
    );
  }

  if (door === "artists" || door === "albums") {
    const grouped = groupSongsBy(door.slice(0, -1));

    return (
      <div className="p-6 max-w-screen-xl mx-auto h-[93dvh] overflow-auto">
        <h1 className="text-2xl font-bold text-white mb-10 capitalize tracking-tight">
          {door === "artists" ? "Browse by Artist" : "Browse by Album"}
        </h1>
        {Object.entries(grouped).map(([groupName, songs]) => (
          <section key={groupName} className="mb-12">
            <h2 className="text-xl font-semibold text-white mb-4">{groupName}</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {songs.map((song) => (
                <div
                  key={song.id}
                  onClick={() => (window.location.href = `/player/${song.id}`)}
                  className="cursor-pointer rounded-xl overflow-hidden bg-white/5 backdrop-blur-md shadow-md hover:shadow-xl hover:scale-[1.02] transform transition duration-300"
                >
                  <div className="relative w-full aspect-square">
                    <Image
                      src={song.cover || "/default.png"}
                      alt={song.title}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  </div>
                  <div className="p-3">
                    <p className="text-white font-medium truncate">{song.title}</p>
                    <p className="text-sm text-neutral-400 truncate">
                      {door === "artists" ? song.album : song.artist}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    );
  }

  const pages = {
    radio: {
      title: "Live Radio",
      icon: <Radio size={32} />,
      placeholder: "Coming soon: curated radio stations for every mood!",
    },
    audiobooks: {
      title: "Audiobooks",
      icon: <BookText size={32} />,
      placeholder: "Relax with short and sweet audiobooks. Coming soon!",
    },
  };

  const data = pages[door];

  if (!data) return null;

  return (
    <div className="p-6 max-w-screen-md mx-auto h-[93dvh]">
      <div className="flex items-center gap-4 mb-6">
        <div className="bg-white/10 p-3 rounded-lg text-white">{data.icon}</div>
        <h1 className="text-2xl font-bold text-white tracking-tight">
          {data.title}
        </h1>
      </div>
      <div className="text-neutral-400 text-sm text-center mt-32">
        {data.placeholder}
      </div>
    </div>
  );
}
