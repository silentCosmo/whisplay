// /app/api/songs/route.js
import { connectToDB } from "@/lib/db";

export async function GET(req) {
  const db = await connectToDB();
  const songs = await db.collection("audiobooks").find({}).toArray();

  const mapped = songs.map(({ _id, ...rest }) => ({
    id: _id.toString(),
    ...rest,
  }));

  return Response.json(mapped);
}