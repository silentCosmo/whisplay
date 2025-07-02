import ImageWithFallback from "@/lib/imageWithFallback";
import { motion } from "motion/react";
import Image from "next/image";

export default function GridCard({ items, onClick }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
      {items.map((song) => (
        <motion.div
          key={song.id}
          className="bg-white/10 rounded-lg p-2 shadow cursor-pointer"
          whileHover={{ scale: 1.03 }}
          onClick={() => onClick(song)}
        >
          <ImageWithFallback
            src={song.cover}
            alt={song.title}
            width={200}
            height={200}
            className="object-cover"
          />
          <h4 className="mt-2 font-medium truncate">{song.title}</h4>
          <p className="text-xs opacity-80 truncate">{song.artist}</p>
        </motion.div>
      ))}
    </div>
  );
}
