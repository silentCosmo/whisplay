import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/db";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q")?.toLowerCase() || "";

  if (!query.trim()) {
    return NextResponse.json([], { status: 200 });
  }

  try {
    const db = await connectToDB();
    const songsCollection = db.collection("songs");

    const songs = await songsCollection
      .find({
        $or: [
          { title: { $regex: query, $options: "i" } },
          { artist: { $regex: query, $options: "i" } },
          { album: { $regex: query, $options: "i" } },
        ],
      })
      .limit(30)
      .toArray();

    const formatted = songs.map((song) => ({
      ...song,
      url: `/api/song?id=${song.id}`,
      cover: song.cover || "/default.png",
    }));

    return NextResponse.json(formatted);
  } catch (err) {
    console.error("Search API error:", err);
    return NextResponse.json({ error: "Failed to search" }, { status: 500 });
  }
}
