import { google } from "googleapis";
import { parseBuffer } from "music-metadata";
import { connectToDB } from "@/lib/db";
import { Readable } from "stream";
import { Vibrant } from "node-vibrant/node";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req) {
  const encoder = new TextEncoder();
  const url = new URL(req.url);
  const force = url.searchParams.get("force") === "true";

  const stream = new ReadableStream({
    async start(controller) {
      const send = (text) => {
        controller.enqueue(encoder.encode(`data: ${text}\n\n`));
      };

      try {
        const auth = new google.auth.GoogleAuth({
          credentials: {
            client_email: process.env.GOOGLE_CLIENT_EMAIL,
            private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
          },
          scopes: [
            "https://www.googleapis.com/auth/drive.readonly",
            "https://www.googleapis.com/auth/drive.file",
          ],
        });

        const drive = google.drive({ version: "v3", auth });
        const list = await drive.files.list({
          q: "mimeType contains 'audio/'",
          fields: "files(id, name, mimeType)",
        });

        const files = list.data.files;
        const db = await connectToDB();
        const songsCollection = db.collection("songs");

        send(`📀 Total files on Drive: ${files.length}`);

        let alreadySynced = 0;
        let synced = 0;

        for (const file of files) {
          const { id: fileId, name: fileName, mimeType } = file;

          const exists = await songsCollection.findOne({ id: fileId });

          // 💡 Skip if already synced AND theme field exists (even if false)
          if (!force && exists && "theme" in exists) {
            alreadySynced++;
            send(`✅ Already synced: ${fileName}`);
            continue;
          }

          send(`🎧 Processing: ${fileName}`);

          try {
            const { data: fileStream } = await drive.files.get(
              { fileId, alt: "media" },
              { responseType: "arraybuffer" }
            );

            const buffer = Buffer.from(fileStream);
            let title = fileName.replace(/\.[^/.]+$/, "");
            let artist = "Unknown Artist";
            let cover = null;
            let duration = 0;
            let theme = null;

            const meta = await parseBuffer(buffer, mimeType);
            title = meta.common.title || title;
            artist = meta.common.artist || artist;
            duration = meta.format.duration || 0;

            const pic = meta.common.picture?.[0];
            if (pic) {
              const imageBuffer = Buffer.from(pic.data);
              const imageStream = Readable.from(imageBuffer);

              const { data: uploaded } = await drive.files.create({
                requestBody: {
                  name: `${fileId}_cover.jpg`,
                  mimeType: pic.format || "image/jpeg",
                  parents: [process.env.GOOGLE_DRIVE_COVER_FOLDER],
                },
                media: {
                  mimeType: pic.format || "image/jpeg",
                  body: imageStream,
                },
              });

              cover = `https://drive.google.com/uc?export=view&id=${uploaded.id}`;

              const palette = await Vibrant.from(imageBuffer).getPalette();
              theme = {
                vibrant: palette.Vibrant?.hex || null,
                darkVibrant: palette.DarkVibrant?.hex || null,
                lightVibrant: palette.LightVibrant?.hex || null,
                muted: palette.Muted?.hex || null,
                darkMuted: palette.DarkMuted?.hex || null,
                lightMuted: palette.LightMuted?.hex || null,
              };
            } else {
              // 💡 No cover available – mark it explicitly so we skip later
              theme = false;
              send(`🎨 No cover found: ${fileName} (theme skipped)`);
            }

            await songsCollection.updateOne(
              { id: fileId },
              {
                $set: {
                  id: fileId,
                  title,
                  artist,
                  cover,
                  duration,
                  theme,
                },
              },
              { upsert: true }
            );

            synced++;
            send(`✅ Synced: ${title}`);
          } catch (err) {
            send(`❌ Error syncing ${fileName}: ${err.message}`);
          }
        }

        send(`🎉 Sync complete.`);
        send(`🔁 Already synced: ${alreadySynced}`);
        send(`🆕 New/Updated: ${synced}`);
        controller.close();
      } catch (err) {
        controller.enqueue(encoder.encode(`data: ❌ Failed: ${err.message}\n\n`));
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
