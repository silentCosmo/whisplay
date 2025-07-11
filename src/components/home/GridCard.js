import ImageWithFallback from "@/lib/imageWithFallback";
import { motion } from "framer-motion";
import AddToQueueButton from "../AddToQueue";
import { useState } from "react";

export default function GridCard({ items, onClick }) {
  // Store scrollText state for each song individually
  const [scrollTextState, setScrollTextState] = useState({});

  const handleTouchStart = (id) => {
    setScrollTextState((prevState) => ({ ...prevState, [id]: true }));
  };

  const handleTouchEnd = (id) => {
    setScrollTextState((prevState) => ({ ...prevState, [id]: false }));
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-6">
      {items.map((song) => (
        <motion.div
          key={song.id}
          onClick={() => onClick(song)}
          whileHover={{ scale: 1.015 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="group relative bg-gradient-to-br from-[#1c1c1e] to-[#2c2c2e] rounded-2xl overflow-hidden shadow-lg hover:shadow-xl cursor-pointer transition-all duration-300"
          onTouchEnd={() => handleTouchEnd(song.id)} 
          onTouchStart={() => handleTouchStart(song.id)}
        >
          <AddToQueueButton song={song} />
          {/* Album Cover */}
          <div className="aspect-square overflow-hidden rounded-xl">
            <ImageWithFallback
              src={song.cover}
              alt={song.title}
              width={400}
              height={400}
              className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
            />
          </div>

          {/* Overlay Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-80" />

          {/* Text Content */}
          <div className="absolute bottom-0 w-full p-3 text-white z-10">
            <p 
              className={`text-sm font-semibold ${!scrollTextState[song.id] ? "truncate" : "whitespace-nowrap"}`} 
              style={{
                animation: song.title.length > 20 && scrollTextState[song.id]
                  ? "scroll-text 10s linear infinite"
                  : "none",
              }}
            >
              {song.title}
            </p>
            <p className="text-xs text-white/70 truncate">{song.artist}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
