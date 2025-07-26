import ImageWithFallback from "@/lib/imageWithFallback";
import { motion } from "framer-motion";
import AddToQueueButton from "../AddToQueue";
import { useState } from "react";
import Skeleton from "../Skeleton";

export default function GridCard({ items, onClick, isLoading}) {
  // Store scrollText state for each song individually
  const [scrollTextState, setScrollTextState] = useState({});

  const handleTouchStart = (id) => {
    setScrollTextState((prevState) => ({ ...prevState, [id]: true }));
  };

  const handleTouchEnd = (id) => {
    setScrollTextState((prevState) => ({ ...prevState, [id]: false }));
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-6">
        {[...Array(8)].map((_, idx) => (
          <div
            key={idx}
            className="group relative bg-gradient-to-br from-[#1c1c1e] to-[#2c2c2e] rounded-2xl overflow-hidden shadow-lg"
          >
            {/* Image Skeleton */}
            <div className="aspect-square overflow-hidden rounded-xl">
              <Skeleton height={400} width={400} borderRadius="0.75rem" />
            </div>

            {/* Overlay Skeleton */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-80" />

            {/* Text Skeleton */}
            <div className="absolute bottom-0 w-full p-3 text-white z-10">
              <Skeleton height={14} width="80%" borderRadius="0.375rem" />
              <Skeleton height={10} width="60%" borderRadius="0.375rem" className={" mt-1.5"} />
            </div>
          </div>
        ))}
      </div>
    );
  }

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
