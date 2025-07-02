"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "motion/react";
import useSongStore from "@/lib/songStore";
import { useEffect, useState } from "react";
import { Header } from "@/components/HomeHeader";
import { useInitSongs } from "@/lib/initSongs";
import Section from "@/components/home/Section";
import HorizontalCardScroll from "@/components/home/HorizontalCardScroll";
import GridCard from "@/components/home/GridCard";
import ImageWithFallback from "@/lib/imageWithFallback";

export default function HomePage() {
  const router = useRouter();
  useInitSongs();

  const { songs, currentSong, setCurrentSong } = useSongStore();
  const [recent, setRecent] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [topTags, setTopTags] = useState([]);

  const [isImageError, setIsImageError] = useState(false);
  
    const handleImageError = () => {
      setIsImageError(true); // Flag when image fails to load
    };
  /* const [topPicks, setTopPicks] = useState([]);
  const [feelGood, setFeelGood] = useState([]);
  const [newReleases, setNewReleases] = useState([]); */
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

    /* const top = [...songs]
      .filter((s) => s.plays)
      .sort((a, b) => b.plays - a.plays)
      .slice(0, 6);

    const feel = songs
      .filter((s) => s.genre === "chill" || s.tags?.includes("vibes"))
      .slice(0, 6);

    const newRelease = [...songs]
      .filter((s) => s.releaseDate)
      .sort((a, b) => new Date(b.releaseDate) - new Date(a.releaseDate))
      .slice(0, 6); */

    //setTopPicks(top);
    //setFeelGood(feel);
    //setNewReleases(newRelease);
  }, [songs]);

  const handleClick = (song) => {
    setCurrentSong(song);
    router.push(`/player/${song.id}`);
  };

  return (
    <div>
      <Header />

      <div className="px-6 py-8 space-y-12">
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
                onClick={() => handleClick(featured[0])}
                className="inline-block bg-vibrant px-6 py-2 rounded-full font-semibold shadow hover:scale-105 transition"
              >
                Listen Now
              </button>
            </div>
          </motion.div>
        )}

        {/* Sections */}
        <Section title="Recently Played">
          <HorizontalCardScroll items={recent} onClick={handleClick} />
        </Section>

        <Section title="Lofi Chill">
          <HorizontalCardScroll
            items={getByTags(["lofi", "chill", "mellow", "dreamy"])}
            onClick={handleClick}
          />
        </Section>

        {topTags
          .filter((tag) => !["lofi", "chill", "mellow", "dreamy"].includes(tag)) // skip lofi
          .map((tag) => (
            <Section key={tag} title={tag[0].toUpperCase() + tag.slice(1)}>
              <GridCard items={getByTags([tag])} onClick={handleClick} />
            </Section>
          ))}

        <Section title="Morning">
          <GridCard
            items={getByTags(["soft", "acoustic", "calm"])}
            onClick={handleClick}
          />
        </Section>

{/*         <Section title="Pop">
          <GridCard
            items={getByTags(["pop", "acoustic"])}
            onClick={handleClick}
          />
        </Section>

        <Section title="Moody">
          <GridCard
            items={getByTags(["moody", "emotional", "sad"])}
            onClick={handleClick}
          />
        </Section>

        <Section title="Energy Boost">
          <GridCard
            items={getByTags(["uplifting", "motivational", "workout"])}
            onClick={handleClick}
          />
        </Section>

        <Section title="Night Lights">
          <GridCard
            items={getByTags(["dreamy", "mellow", "lofi"])}
            onClick={handleClick}
          />
        </Section>

        <Section title="Romantic Vibes">
          <GridCard
            items={getByTags(["romantic", "love"])}
            onClick={handleClick}
          />
        </Section>

        <Section title="Retro Rewind">
          <HorizontalCardScroll
            items={getByTags(["80s", "retro"])}
            onClick={handleClick}
          />
        </Section> */}

        {/* <Section title="Recently Played">
          <GridCard items={recent} onClick={handleClick} />
        </Section> */}
      </div>
    </div>
  );
}
