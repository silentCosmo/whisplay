// /app/api/sync/route.js

import { google } from "googleapis";
import { parseBuffer } from "music-metadata";
//import { connectToDB } from "@/lib/db";
import fetch from "node-fetch";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
      },
      scopes: ["https://www.googleapis.com/auth/drive.readonly", "https://www.googleapis.com/auth/drive.file"],
    });

    const drive = google.drive({ version: "v3", auth });

    // 1. Get the list of files from your music folder (optional: use parents filter)
    const list = await drive.files.list({
      q: "mimeType contains 'audio/'",
      fields: "files(id, name, mimeType)",
    });

    const files = list.data.files;

    const db = await connectToDB();
    const songsCollection = db.collection("songs");

    for (const file of files) {
      const fileId = file.id;
      const fileName = file.name;

      // 2. Skip if already synced
      const exists = await songsCollection.findOne({ id: fileId });
      if (exists) continue;

      console.log(`⏳ Syncing: ${fileName}`);

      // 3. Download a short portion of the file
      const { data: stream } = await drive.files.get(
        { fileId, alt: "media" },
        { responseType: "arraybuffer" }
      );

      const buffer = Buffer.from(stream);

      let title = fileName.replace(/\.[^/.]+$/, "");
      let artist = "Unknown";
      let cover = "/default.jpg";
      let duration = 0;

      // 4. Parse metadata
      try {
        const meta = await parseBuffer(buffer, file.mimeType);

        title = meta.common.title || title;
        artist = meta.common.artist || artist;
        duration = meta.format.duration || 0;

        const pic = meta.common.picture?.[0];
        if (pic) {
          // 5. Upload cover to Drive
          const { data: uploaded } = await drive.files.create({
            requestBody: {
              name: `${fileId}_cover.jpg`,
              mimeType: pic.format || "image/jpeg",
            },
            media: {
              mimeType: pic.format || "image/jpeg",
              body: Buffer.from(pic.data),
            },
            fields: "id",
          });

          // 6. Make it public
          await drive.permissions.create({
            fileId: uploaded.id,
            requestBody: {
              role: "reader",
              type: "anyone",
            },
          });

          cover = `https://drive.google.com/uc?export=view&id=${uploaded.id}`;
        }
      } catch (err) {
        console.warn(`⚠️ Failed to parse metadata for ${fileName}:`, err);
      }

      // 7. Save to DB
      await songsCollection.updateOne(
        { id: fileId },
        {
          $set: {
            id: fileId,
            title,
            artist,
            cover,
            duration,
          },
        },
        { upsert: true }
      );

      console.log(`✅ Synced: ${title}`);
    }

    return new Response("Sync completed.", { status: 200 });
  } catch (err) {
    console.error("❌ Sync failed:", err);
    return new Response("Failed to sync songs", { status: 500 });
  }
}
