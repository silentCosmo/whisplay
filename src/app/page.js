"use client";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import useSongStore from "@/lib/songStore";
import { useEffect, useState } from "react";
import { Header } from "@/components/HomeHeader";

export default function HomePage() {
  const router = useRouter();
  const { songs, currentSong, setCurrentSong } = useSongStore();
  const [featured, setFeatured] = useState([]);
  const [recent, setRecent] = useState([]);

  useEffect(() => {
    if (currentSong) {
      const recent = JSON.parse(localStorage.getItem("recentPlayed") || "[]");
      const updated = [
        currentSong,
        ...recent.filter((s) => s.id !== currentSong.id),
      ].slice(0, 15);
      localStorage.setItem("recentPlayed", JSON.stringify(updated));
    }
  }, [currentSong]);

  useEffect(() => {
    const recent = JSON.parse(localStorage.getItem("recentPlayed") || "[]");
    setFeatured(songs.slice(0, 5));
    setRecent(recent);
  }, [songs]);

  const handleClick = (song) => {
    setCurrentSong(song);
    router.push(`/player/${song.id}`);
  };

  return (
    <div className="">
      <Header/>
    <div className="px-6 py-8 space-y-12">
      {/* Hero */}
      {featured[0] && (
        <motion.div
          className="relative h-[300px] rounded-3xl overflow-hidden shadow-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <Image
            src={featured[0].cover}
            alt={featured[0].title}
            layout="fill"
            objectFit="cover"
            className="brightness-75"
          />
          <div className="absolute inset-0 flex flex-col justify-center items-center text-center text-white px-4">
            <h1 className="text-3xl font-bold mb-2">{featured[0].title}</h1>
            <p className="opacity-80 mb-4">{featured[0].artist}</p>
            <button
              onClick={() => handleClick(featured[0])}
              className="inline-block bg-vibrant px-6 py-2 rounded-full font-semibold shadow hover:scale-105 transition"
            >
              Listen Now
            </button>
          </div>
        </motion.div>
      )}

      {/* Featured Playlists */}
      <Section title="Featured Playlists">
        <HorizontalCardScroll items={featured} onClick={handleClick} />
      </Section>

      {/* Recently Played */}
      <Section title="Recently Played">
        <GridCard items={recent} onClick={handleClick} />
      </Section>
    </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-white">{title}</h2>
      {children}
    </div>
  );
}

function HorizontalCardScroll({ items, onClick }) {
  return (
    <div className="flex space-x-4 overflow-x-auto pb-2">
      {items.map((song) => (
        <motion.div
          key={song.id}
          className="min-w-[160px] rounded-lg shadow-lg overflow-hidden cursor-pointer"
          whileHover={{ scale: 1.05 }}
          onClick={() => onClick(song)}
        >
          <Image
            src={song.cover}
            alt={song.title}
            width={160}
            height={160}
            objectFit="cover"
          />
          <div className="p-2 bg-black/50">
            <p className="text-sm font-semibold truncate">{song.title}</p>
            <p className="text-xs opacity-80 truncate">{song.artist}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function GridCard({ items, onClick }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
      {items.map((song) => (
        <motion.div
          key={song.id}
          className="bg-white/10 rounded-lg p-2 shadow cursor-pointer"
          whileHover={{ scale: 1.03 }}
          onClick={() => onClick(song)}
        >
          <Image
            src={song.cover}
            alt={song.title}
            width={200}
            height={200}
            objectFit="cover"
          />
          <h4 className="mt-2 font-medium truncate">{song.title}</h4>
          <p className="text-xs opacity-80 truncate">{song.artist}</p>
        </motion.div>
      ))}
    </div>
  );
}
