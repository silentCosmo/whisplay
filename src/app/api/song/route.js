// app/api/song/route.js
import { google } from "googleapis";
import { NextResponse } from "next/server";
import { PassThrough } from "stream";

export async function GET(req) {
  const url = new URL(req.url);
  const fileId = url.searchParams.get("id");
  if (!fileId) return NextResponse.json({ error: "Missing file ID" }, { status: 400 });

  const range = req.headers.get("range");

  try {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
      },
      scopes: ["https://www.googleapis.com/auth/drive.readonly"],
    });

    const drive = google.drive({ version: "v3", auth });

    // Step 1: Get metadata (mainly for file size)
    const meta = await drive.files.get({
      fileId,
      fields: "size, mimeType, name",
    });

    const fileSize = parseInt(meta.data.size);
    const mimeType = meta.data.mimeType || "audio/mpeg";
    const fileName = meta.data.name || "unknown";

    let start = 0;
    let end = fileSize - 1;

    if (range) {
      const match = range.match(/bytes=(\d+)-(\d*)/);
      if (match) {
        start = parseInt(match[1], 10);
        if (match[2]) end = parseInt(match[2], 10);
      }
    }

    const chunkSize = end - start + 1;

    // Step 2: Request byte-range from Google Drive directly
    const { data: stream } = await drive.files.get(
      {
        fileId,
        alt: "media",
      },
      {
        headers: {
          Range: `bytes=${start}-${end}`,
        },
        responseType: "stream",
      }
    );

    const passThrough = new PassThrough();
    stream.pipe(passThrough);

    return new Response(passThrough, {
      status: range ? 206 : 200,
      headers: {
        "Content-Range": `bytes ${start}-${end}/${fileSize}`,
        "Accept-Ranges": "bytes",
        "Content-Length": chunkSize,
        "Content-Type": mimeType,
        "Content-Disposition": `inline; filename="${fileName}"`,
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error) {
    console.error("🧨 Streaming error:", error);
    return new Response("Stream error", { status: 500 });
  }
}
