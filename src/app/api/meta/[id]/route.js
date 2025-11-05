import { connectToDB } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req, { params }) {
  const { id } = params; // params is already an object
  if (!id) {
    return new Response(JSON.stringify({ error: "Missing ID" }), { status: 400 });
  }

  try {
    const db = await connectToDB();
    const songsCollection = db.collection("songs");
    const audiobooksCollection = db.collection("audiobooks");

    // Try songs first
    let song = await songsCollection.findOne({ id });

    // If not found in songs, check audiobooks
    if (!song) {
      song = await audiobooksCollection.findOne({ id });
    }

    if (!song) {
      return new Response(JSON.stringify({ error: "Song/Audiobook not found" }), {
        status: 404,
      });
    }

    return new Response(
      JSON.stringify({
        id: song.id || null,
        title: song.title || null,
        artist: song.artist || null,
        cover: song.cover ?? null,
        format: song.format || null,
        bitrate: song.bitrate || null,
        sampleRate: song.sampleRate || null,
        bitDepth: song.bitDepth || null,
        qualityText: song.qualityText || null,
        tags: song.tags || null,
        duration: song.duration || null, // <-- make sure duration is included
        type: song.type || "song", // optional, helps frontend know if audiobook
        url: song.url || null, // especially important for audiobooks
      }),
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (err) {
    console.error("❌ Failed to fetch meta:", err);
    return new Response(JSON.stringify({ error: "Server error" }), {
      status: 500,
    });
  }
}
