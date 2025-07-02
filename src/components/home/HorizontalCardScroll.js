import ImageWithFallback from "@/lib/imageWithFallback";
import { motion } from "motion/react";
export default function HorizontalCardScroll({ items, onClick }) {
  return (
    <div className="flex space-x-4 overflow-x-auto pb-2">
      {items.map((song) => (
        <motion.div
          key={song.id}
          className="min-w-[160px] rounded-lg shadow-lg overflow-hidden cursor-pointer"
          whileHover={{ scale: 1.05 }}
          onClick={() => onClick(song)}
        >
          <ImageWithFallback
            src={song.cover}
            alt={song.title}
            width={160}
            height={160}
            className="object-cover"
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
