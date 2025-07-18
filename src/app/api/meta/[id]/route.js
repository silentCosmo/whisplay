import { connectToDB } from "@/lib/db";

export const dynamic = "force-dynamic"; // if needed

export async function GET(req, { params }) {
  const { id } = await params;
  console.log(id);
  

  try {
    const db = await connectToDB();
    const songs = db.collection("songs");

    const song = await songs.findOne({ id });

    if (!song) {
      return new Response(JSON.stringify({ error: "Song not found" }), {
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
