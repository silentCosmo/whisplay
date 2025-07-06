"use client";

import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import useSongStore from "@/lib/songStore";
import { useEffect, useState } from "react";
import { Header } from "@/components/HomeHeader";
import { useInitSongs } from "@/lib/initSongs";
import Section from "@/components/home/Section";
import HorizontalCardScroll from "@/components/home/HorizontalCardScroll";
import GridCard from "@/components/home/GridCard";
import ImageWithFallback from "@/lib/imageWithFallback";

const moods = [
  { title: "Chill & Night", tags: ["chill", "focus", "night"] },
  { title: "Party Boost", tags: ["party", "dance", "energetic"] },
  { title: "Emotional & Sad", tags: ["sad", "emotional", "moody"] },
  { title: "Romantic", tags: ["romantic", "love", "intimate"] },
  { title: "Sleep & Calm", tags: ["sleep", "calm", "soft"] },
  { title: "Instrumental", tags: ["instrumental", "classical", "piano"] },
  { title: "Rock & Guitar", tags: ["rock", "guitar", "band"] },
  { title: "Retro Vibes", tags: ["retro", "80s", "vintage"] },
  { title: "Indie & Acoustic", tags: ["indie", "folk", "acoustic"] },
  {
    title: "Motivation & Workout",
    tags: ["motivational", "uplifting", "workout"],
  },
];

const tempoSections = [
  { title: "Slow & Lofi", tags: ["lofi"] },
  { title: "Mid-tempo Groove", tags: ["groove"] },
  { title: "Mainstream Pop", tags: ["pop"] },
  { title: "Workout Boost", tags: ["workout"] },
  { title: "Hardcore Tempo", tags: ["hardcore"] },
];

// 📅 Era-based tags
const eraSections = [
  { title: "Fresh Hits (2020s)", tags: ["fresh"] },
  { title: "2010s Flashback", tags: ["2010s"] },
  { title: "2000s Classics", tags: ["2000s"] },
  { title: "90s Gold", tags: ["90s"] },
  { title: "Retro 80s", tags: ["80s"] },
  { title: "Timeless Classics", tags: ["classic"] },
];

const keySections = [
  { title: "Key of C", tags: ["key-c"] },
  { title: "Key of D", tags: ["key-d"] },
  { title: "Key of E", tags: ["key-e"] },
  { title: "Key of F", tags: ["key-f"] },
  { title: "Key of G", tags: ["key-g"] },
  { title: "Key of A", tags: ["key-a"] },
  { title: "Key of B", tags: ["key-b"] },
  {
    title: "Sharp & Flat Keys",
    tags: ["key-g♯", "key-a♭", "key-f♯", "key-d♯", "key-e♭"],
  },
];

export default function HomePage() {
  const router = useRouter();
  useInitSongs();

  const { songs, currentSong, setCurrentSong } = useSongStore();
  const [recent, setRecent] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [topTags, setTopTags] = useState([]);
  const getByTags = (tagList) =>
    songs.filter((s) => s.tags?.some((t) => tagList.includes(t)));

  useEffect(() => {
    if (currentSong) {
      const recent = JSON.parse(localStorage.getItem("recentPlayed") || "[]");
      const updated = [
        currentSong,
        ...recent.filter((s) => s.id !== currentSong.id),
      ].slice(0, 15);
      localStorage.setItem("recentPlayed", JSON.stringify(updated));
    }
  }, [currentSong]);

  useEffect(() => {
    const random = [...songs].sort(() => 0.5 - Math.random()).slice(0, 5);
    setFeatured(random);
    const recent = JSON.parse(localStorage.getItem("recentPlayed") || "[]");
    setRecent(recent);

    const tagMap = new Map();

    songs.forEach((song) => {
      song.tags?.forEach((tag) => {
        tagMap.set(tag, (tagMap.get(tag) || 0) + 1);
      });
    });

    const sorted = Array.from(tagMap.entries())
      .sort((a, b) => b[1] - a[1])
      .filter(([tag]) => !["explore"].includes(tag)) // skip generic ones
      .slice(0, 8); // limit to top 8 tags

    setTopTags(sorted.map(([tag]) => tag));
  }, [songs]);

  const usedIds = new Set();

  const getUniqueByTags = (tagList, limit = 8) => {
    const filtered = [];
    for (const song of songs) {
      if (
        song.tags?.some((t) => tagList.includes(t)) &&
        !usedIds.has(song.id)
      ) {
        filtered.push(song);
        usedIds.add(song.id);
        if (filtered.length === limit) break;
      }
    }
    return filtered;
  };

  const suggestions = songs.filter((s) => !usedIds.has(s.id)).slice(0, 6);

  const handleClick = (song, playlistId, playlistSongs) => {
    const { setPlaylist, setCurrentPlaylistId, setCurrentSong } =
      useSongStore.getState();

    console.log("🎵 Playlist selected:", playlistId);
    console.log("📃 Playlist songs count:", playlistSongs.length);
    console.log("▶️ Current song selected:", song);
    console.log("🗂️ Full playlist songs:", playlistSongs);

    setPlaylist(playlistId, playlistSongs);
    setCurrentPlaylistId(playlistId);
    setCurrentSong(song);

    router.push(`/player/${song.id}`);
  };

  return (
    <div>

      <Header />
      <div className="px-6 py-18 mb-10 space-y-12 overflow-auto h-[93dvh]">
        {/* Hero */}
        {featured[0] && (
          <motion.div
            className="relative h-[300px] rounded-3xl overflow-hidden shadow-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            <ImageWithFallback
              src={featured[0].cover}
              alt={featured[0].title}
              fill
              className="object-cover brightness-75"
            />
            <div className="absolute inset-0 flex flex-col justify-center items-center text-center text-white px-4">
              <h1 className="text-3xl font-bold mb-2">{featured[0].title}</h1>
              <p className="opacity-80 mb-4">{featured[0].artist}</p>
              <button
                onClick={() => handleClick(featured[0], "featured", featured)}
                className="inline-block bg-vibrant px-6 py-2 rounded-full font-semibold shadow hover:scale-105 transition"
              >
                Listen Now
              </button>
            </div>
          </motion.div>
        )}

        {/* Sections */}
        <Section title="Recently Played">
          <HorizontalCardScroll
            items={recent}
            onClick={(song) => handleClick(song, "recently-played", recent)}
          />
        </Section>

        {suggestions.length > 0 && (
          <Section title="🎁 Just For You">
            <GridCard
              items={suggestions}
              onClick={(song) => handleClick(song, "suggestions", suggestions)}
            />
          </Section>
        )}

        <Section title="Lofi Chill">
          <HorizontalCardScroll
            items={getUniqueByTags(["lofi", "chill", "mellow", "dreamy"])}
            onClick={(song) =>
              handleClick(
                song,
                "lofi-chill",
                getUniqueByTags(["lofi", "chill", "mellow", "dreamy"])
              )
            }
          />
        </Section>

        {[...moods, ...tempoSections, ...eraSections, ...keySections].map(
          ({ title, tags }) => {
            const items = songs.filter((s) =>
              s.tags?.some((t) => tags.includes(t))
            );
            if (items.length === 0) return null;

            // Create a playlistId by slugifying title or tags (simple example)
            const playlistId = title.toLowerCase().replace(/\s+/g, "-");

            return (
              <Section key={title} title={title}>
                <GridCard
                  items={items.slice(0, 8)}
                  onClick={(song) => handleClick(song, playlistId, items)}
                />
              </Section>
            );
          }
        )}

        {/* {[...moods, ...tempoSections, ...eraSections, ...keySections].map(({ title, tags }) => {
          const items = songs.filter((s) =>
            s.tags?.some((t) => tags.includes(t))
          );
          if (items.length === 0) return null;
          return (
            <Section key={title} title={title}>
              <GridCard items={items.slice(0, 8)} onClick={handleClick} />
            </Section>
          );
        })} */}
      </div>
    </div>
  );
}
