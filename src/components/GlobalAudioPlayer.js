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
  /* useEffect(() => {
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
  }, [currentSong]); */

  useEffect(() => {
  const audio = audioRef.current;
  if (!audio || !currentSong?.url) return;

  const fullUrl = location.origin + currentSong.url;

  if (audio.src !== fullUrl) {
    audio.src = fullUrl;
    audio.load();

    // Only play if playing state is true (so manual pause still works)
    if (playing) {
      const tryPlay = () => {
        audio.play().catch((err) => {
          console.warn("🎧 Auto play failed:", err.message);
          setPlaying(false);
        });
      };

      if (audio.readyState >= 2) {
        tryPlay();
      } else {
        const onLoadedMeta = () => {
          tryPlay();
          audio.removeEventListener("loadedmetadata", onLoadedMeta);
        };
        audio.addEventListener("loadedmetadata", onLoadedMeta);
      }
    }
  }
}, [currentSong, playing]);



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
          return
        } /* else {
          setPlaying(false);
          } */
       playNext();
       
          const {
    getCurrentPlaylistSongs,
    currentSong,
    setCurrentSong,
    setPlaying,
    generateSmartAutoplayPreview,
  } = useSongStore.getState();

  const playlist = getCurrentPlaylistSongs?.() || [];
  const currentIndex = playlist.findIndex((s) => s.id === currentSong?.id);

  if (currentIndex >= 0 && currentIndex < playlist.length - 1) {
    const next = playlist[currentIndex + 1];
    setCurrentSong(next);
    setPlaying(true); // <==== Play immediately!
    return;
  }

  const fallbackQueue = generateSmartAutoplayPreview?.(currentSong) || [];
  if (fallbackQueue.length > 0) {
    console.log("🎯 Playing from Up Next fallback:", fallbackQueue[0]?.title);
    setCurrentSong(fallbackQueue[0]);
    setPlaying(true); // <==== Play immediately!
    return;
  }

  console.log("⛔ Playback ended. No songs left.");
  setPlaying(false);

      }}
    />
  );
}
