import ImageWithFallback from "@/lib/imageWithFallback";
import { motion } from "framer-motion";
import AddToQueueButton from "../AddToQueue";
import { useState } from "react";
import Skeleton from "../Skeleton";

export default function HorizontalCardScroll({ items, onClick, isLoading }) {
  const [scrollText, setScrollText] = useState(false)

  if (isLoading) {
    return (
      <div className="flex overflow-x-auto space-x-5 px-2 pb-4 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent snap-x snap-mandatory">
        {/* Skeleton Loader for Cards */}
        {[...Array(5)].map((_, idx) => (
          <div key={idx} className="flex-shrink-0 snap-start w-44 rounded-2xl overflow-hidden relative cursor-pointer group bg-gradient-to-br from-[#1c1c1e] to-[#2c2c2e] shadow-md">
            <Skeleton height={176} width={176} borderRadius="1.25rem" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent z-10" />
            <div className="absolute bottom-0 left-0 w-full p-3 z-20 text-white">
              <Skeleton height={14} width="70%" />
              <Skeleton height={10} width="50%" className={" mt-1"} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex overflow-x-auto space-x-5 px-2 pb-4 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent snap-x snap-mandatory">
      {items.map((song) => (
        <motion.div
          key={song.id}
          onClick={() => onClick(song)}
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="flex-shrink-0 snap-start w-44 rounded-2xl overflow-hidden relative cursor-pointer group bg-gradient-to-br from-[#1c1c1e] to-[#2c2c2e] shadow-md hover:shadow-xl transition-shadow duration-300"
           onTouchEnd={()=>setScrollText(false)} onTouchStart={()=>setScrollText(true)}
        >
          <AddToQueueButton song={song} />
          {/* Album Art */}
          <div className="relative aspect-square w-full overflow-hidden">
            <ImageWithFallback
              src={song.cover}
              alt={song.title}
              width={176}
              height={176}
              className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
            />

            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent z-10" />

            {/* Text overlay */}
            <div className="absolute bottom-0 left-0 w-full p-3 z-20 text-white">
              <p className={`text-sm font-semibold ${!scrollText? "truncate": "whitespace-nowrap"}`} style={{animation:
                  song.title.length > 20 && scrollText
                    ? "scroll-text 10s linear infinite"
                    : "none",
              }} >{song.title}</p>
              <p className="text-xs text-white/70 truncate">{song.artist}</p>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
