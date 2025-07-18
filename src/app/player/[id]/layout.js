// app/player/layout.js

/* export async function generateMetadata() {
  const cookieStore = await cookies();
  const lastPlayedId = await cookieStore.get("last-played-song")?.value;

  if (!lastPlayedId) {
    return {
      title: "Now Playing | Whisplay",
      description: "Listen to your favorite tracks with style.",
    };
  }

  try {
    const song = await fetchSongById(lastPlayedId);
    console.log("lpid",lastPlayedId);
    
    if (!song) throw new Error("Song not found");

    return {
      title: `${song.title} · ${song.artist} | Whisplay`,
      description: `Now playing: ${song.title} by ${song.artist}`,
      openGraph: {
        title: song.title,
        description: song.artist,
        images: [song.cover],
      },
      twitter: {
        card: "summary_large_image",
        title: song.title,
        description: song.artist,
        images: [song.cover],
      },
    };
  } catch (error) {
    console.warn("Error fetching song for metadata:", error);
    return {
      title: "Now Playing | Whisplay",
      description: "Enjoy the rhythm of Whisplay.",
    };
  }
} */

export async function generateMetadata({ params }) {
  const { id: lastPlayedId } = await params; // <-- await here!

  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/meta/${lastPlayedId}`);
  
  if (!res.ok) {
    console.error("Error fetching song for metadata:", res.status);
    return {
      title: "Whisplay – Listen in FLAC, High-Res & Pure Audio",
      description: "Explore the magic of music. Powered by Whisplay.",
    };
  }
  
  const song = await res.json();
  

  return {
    title: `${song.title} · ${song.artist} | Whisplay`,
    description: `${song.qualityText} — Enjoy the beauty of ${song.title} by ${song.artist} on Whisplay.`,
    openGraph: {
      images: [
        {
          url: song.cover,
          width: 1200,
          height: 630,
          alt: song.title,
        },
      ],
    },
  };
}



export default function PlayerLayout({ children }) {
  return <>{children}</>;
}
