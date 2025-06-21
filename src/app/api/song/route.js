// app/api/song/route.js
import { google } from "googleapis";
import { NextResponse } from "next/server";
import { PassThrough } from "stream";

export async function GET(req) {
  const fileId = new URL(req.url).searchParams.get("id");
  if (!fileId) return NextResponse.json({ error: "Missing file ID" }, { status: 400 });

  try {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
      },
      scopes: ["https://www.googleapis.com/auth/drive.readonly"],
    });

    const drive = google.drive({ version: "v3", auth });

    // Step 1: Get the file metadata
    const meta = await drive.files.get({
      fileId,
      fields: "mimeType, name, size",
    });

    const mimeType = meta.data.mimeType || "audio/mpeg"; // fallback
    const fileName = meta.data.name || "unknown";

    // Step 2: Get file stream from Google Drive
    const { data: stream } = await drive.files.get(
      { fileId, alt: "media" },
      { responseType: "stream" }
    );

    const passThrough = new PassThrough();
    stream.pipe(passThrough);

    return new Response(passThrough, {
      headers: {
        "Content-Type": mimeType,
        "Content-Disposition": `inline; filename="${fileName}"`,
        "Cache-Control": "no-cache",
        "Accept-Ranges": "bytes",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error) {
    console.error("🧨 Streaming failed:", error);
    return new Response("Stream error", { status: 500 });
  }
}
