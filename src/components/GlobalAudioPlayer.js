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
    setIsBuffering,
  } = useSongStore();

  useEffect(() => {
    if (audioRef.current) {
      setAudioRef(audioRef.current);
    }
  }, []);

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
          /* audio.play().catch((err) => {
            console.warn("🎧 Auto play failed:", err.message);
            setPlaying(false);
          }); */

          audio
            .play()
            .then(() => setPlaying(true))
            .catch((err) => {
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

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleWaiting = () => {
      useSongStore.getState().setIsBuffering(true);
    };
    const handleCanPlay = () => {
      useSongStore.getState().setIsBuffering(false);
    };

    audio.addEventListener("waiting", handleWaiting);
    audio.addEventListener("canplay", handleCanPlay);
    audio.addEventListener("canplaythrough", handleCanPlay);

    return () => {
      audio.removeEventListener("waiting", handleWaiting);
      audio.removeEventListener("canplay", handleCanPlay);
      audio.removeEventListener("canplaythrough", handleCanPlay);
    };
  }, [playing, currentSong]);

  return (
    <audio
      crossOrigin="anonymous"
      ref={audioRef}
      preload="auto"
      autoPlay
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
          return;
        } /* else {
          setPlaying(false);
          } */

        playNext();
      }}
    />
  );
}
