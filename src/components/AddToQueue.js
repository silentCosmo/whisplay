"use client";

import { useRef, useState } from "react";
import { TbPlaylistAdd } from "react-icons/tb";
import { CgPlayListCheck } from "react-icons/cg";
import useSongStore from "@/lib/songStore";
import QueueFlyAnimation from "@/components/QueueFlyAnimation";

export default function AddToQueueButton({ song, className = "", iconSize = 24 }) {
  const { queue, addToQueue } = useSongStore();
  const isQueued = queue?.some((s) => s.id === song?.id);

  const btnRef = useRef(null);
  const [flying, setFlying] = useState(false);

  const handleClick = (e) => {
    e.stopPropagation();
    if (!isQueued && btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      const position = { top: rect.top, left: rect.left };
      setFlying(position);
      addToQueue(song); // can delay if needed
    }
  };

  return (
    <>
      <button
        ref={btnRef}
        onClick={handleClick}
        disabled={isQueued}
        title={isQueued ? "Already in Queue" : "Add to Queue"}
        className={`absolute top-0 -right-1 z-20 p-[6px] rounded-bl-2xl rounded-tr-2xl text-white transition-all backdrop-blur-xl ${
          !isQueued
            ? "bg-black/40 cursor-default"
            : "hover:scale-105 active:scale-95 bg-black/80"
        } ${className}`}
        //style={{ background: song.theme?.vibrant }}
      >
        {isQueued ? (
          <CgPlayListCheck size={iconSize} />
        ) : (
          <TbPlaylistAdd size={iconSize} />
        )}
      </button>

      {flying && (
        <QueueFlyAnimation
          song={song}
          from={flying}
          onComplete={() => setFlying(null)}
        />
      )}
    </>
  );
}
