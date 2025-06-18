// app/api/meta/[id]/route.js

import { google } from "googleapis";
import mm from "music-metadata";
import { Readable } from "stream";

export async function GET(req, { params }) {
  const fileId = params.id;

  try {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
      },
      scopes: ["https://www.googleapis.com/auth/drive.readonly"],
    });

    const drive = google.drive({ version: "v3", auth });

    const { data } = await drive.files.get(
      { fileId, alt: "media" },
      { responseType: "stream" }
    );

    const buffer = await streamToBuffer(data);
    const metadata = await mm.parseBuffer(buffer, null, { duration: false });

    const picture = metadata.common.picture?.[0];
    const cover =
      picture &&
      `data:${picture.format};base64,${Buffer.from(picture.data).toString("base64")}`;

    return Response.json({
      title: metadata.common.title,
      artist: metadata.common.artist,
      album: metadata.common.album,
      cover,
    });
  } catch (err) {
    console.error("Meta fetch error:", err);
    return new Response("Failed to extract metadata", { status: 500 });
  }
}

function streamToBuffer(stream) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    stream.on("data", (d) => chunks.push(d));
    stream.on("end", () => resolve(Buffer.concat(chunks)));
    stream.on("error", reject);
  });
}
