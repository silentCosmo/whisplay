import { connectToDB } from "@/lib/db";

export async function GET(req) {
  try {
    const db = await connectToDB();
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type"); // 👈 optional filter
    
    const query = type ? { type } : {}; // e.g. { type: "audiobook" } or {}

    const songs = await db.collection("songs").find(query).toArray();

    const mapped = songs.map(({ _id, ...rest }) => ({
      id: _id.toString(),
      ...rest,
    }));

    return Response.json(mapped);
  } catch (err) {
    console.error("Error fetching songs:", err);
    return new Response(JSON.stringify({ error: "Failed to fetch songs" }), {
      status: 500,
    });
  }
}
