"use client"
import { useEffect, useState } from "react";

export default function usePersistentState(key, defaultValue) {
  const [value, setValue] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(key);
        return stored ? JSON.parse(stored) : defaultValue;
      } catch {
        return defaultValue;
      }
    }
    return defaultValue;
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(key, JSON.stringify(value));
    }
  }, [key, value]);

  return [value, setValue];

  useEffect(() => {
  if (audioRef.current) {
    audioRef.current.volume = volume;
  }
}, [volume]);

}
