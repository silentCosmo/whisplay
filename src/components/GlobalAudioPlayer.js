"use client";

import { useEffect, useRef } from "react";
import useSongStore from "@/lib/songStore";
import { getAudioContext } from "@/lib/audioContext";

export default function GlobalAudioProvider() {
  const audioRef = useRef(null);
  const {
    setAudioRef,
    currentSong,
    playing,
    setPlaying,
    repeat,
    playNext,
    setDuration,
    setCurrentTime,
  } = useSongStore();

  useEffect(() => {
    if (audioRef.current) {
      setAudioRef(audioRef.current);
    }
  }, []);

  // Handle song change
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentSong?.url) return;

    const fullUrl = location.origin + currentSong.url;

    if (audio.src !== fullUrl) {
      audio.src = fullUrl;
      audio.load();
      if (playing) {
        audio
          .play()
          .then(() => setPlaying(true))
          .catch(() => setPlaying(false));
      }
    }
  }, [currentSong]);

  // Handle playing state
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.play().catch(() => setPlaying(false));
    } else {
      audio.pause();
    }
  }, [playing]);

  return (
    <audio
      crossOrigin="anonymous"
      ref={audioRef}
      preload="auto"
      onTimeUpdate={(e) => {
        setCurrentTime(e.target.currentTime);
      }}
      onLoadedMetadata={(e) => {
        setDuration(e.target.duration);
      }}
      onPlay={() => {
        setPlaying(true);
        const ctx = getAudioContext();
        if (ctx.state === "suspended") ctx.resume();
      }}
      onPause={() => setPlaying(false)}
      onEnded={() => {
        if (repeat === "one") {
          audioRef.current.currentTime = 0;
          audioRef.current.play();
        } else {
          setPlaying(false);
          playNext();
        }
      }}
    />
  );
}
