"use client";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import Image from "next/image";

export default function QueueFlyAnimation({ song, from, onComplete }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const timeout = setTimeout(onComplete, 900); // cleanup after animation
    return () => clearTimeout(timeout);
  }, []);

  if (!mounted || !from) return null;

  return createPortal(
    <motion.div
      initial={{
        top: from.top,
        left: from.left,
        scale: 1,
        opacity: 1,
      }}
      animate={{
        top: "92%", // Bottom area, just above your mini-player
        left: "50%",
        x: "-50%",
        scale: 0.6,
        opacity: 0.8,
        rotate: 360,
      }}
      transition={{
        duration: 0.9,
        ease: "easeInOut",
      }}
      className="fixed w-16 h-16 rounded-full overflow-hidden z-[9999] shadow-lg"
    >
      <Image
        src={song.cover}
        alt="Disc Cover"
        width={64}
        height={64}
        className="object-cover w-full h-full rounded-full"
      />
    </motion.div>,
    document.getElementById("animation-root")
  );
}
