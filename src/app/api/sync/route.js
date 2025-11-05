import { google } from "googleapis";
import { parseBuffer } from "music-metadata";
import { connectToDB } from "@/lib/db";
import { Readable } from "stream";
import { Vibrant } from "node-vibrant/node";
import { autoTags } from "@/lib/autoTags";
import { cookies as getCookies } from "next/headers";

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
        /* const auth = new google.auth.GoogleAuth({
          credentials: {
            client_email: process.env.GOOGLE_CLIENT_EMAIL,
            private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
          },
          scopes: [
            "https://www.googleapis.com/auth/drive.readonly",
            "https://www.googleapis.com/auth/drive.file",
          ],
        }); */

        const allCookies = await getCookies(); // ✅ await here

        console.log("ak", allCookies);

        const accessToken = allCookies.get("google_access_token")?.value;
        const refreshToken = allCookies.get("google_refresh_token")?.value;

        if (!accessToken) {
          return new Response("❌ Not authorized. Please login first.", {
            status: 401,
          });
        }

        const oauth2Client = new google.auth.OAuth2(
          process.env.GOOGLE_CLIENT_ID,
          process.env.GOOGLE_CLIENT_SECRET,
          process.env.GOOGLE_REDIRECT_URI
        );

        oauth2Client.setCredentials({
          access_token: accessToken,
          refresh_token: refreshToken,
        });

        // (Optional) refresh token handling
        oauth2Client.on("tokens", async (tokens) => {
          const cookieStore = await getCookies();
          if (tokens.access_token) {
            cookieStore.set("google_access_token", tokens.access_token, {
              httpOnly: true,
              secure: true,
              sameSite: "Lax",
              maxAge: 60 * 60 * 24, // 1 day
            });
          }
        });

        const drive = google.drive({ version: "v3", auth: oauth2Client });

        const AUDIOBOOK_FOLDER_ID = process.env.GOOGLE_AUDIOBOOK_FOLDER_ID;

        const list = await drive.files.list({
          q: "mimeType contains 'audio/' and trashed = false",
          fields: "files(id, name, mimeType, parents)",
        });

        const files = list.data.files;
        const db = await connectToDB();
        const songsCollection = db.collection("songs");

        send(`📀 Total files on Drive: ${files.length}`);

        let alreadySynced = 0;
        let synced = 0;

        for (let index = 0; index < files.length; index++) {
  const file = files[index];
  const { id: fileId, name: fileName, mimeType } = file;
  const isAudiobook = file.parents?.includes(AUDIOBOOK_FOLDER_ID);

  try {
    // Check if file still exists on Drive
    await drive.files.get({ fileId });
  } catch (err) {
    if (err.code === 404) {
      // If file is deleted or trashed, remove from DB
      const collection = isAudiobook
        ? db.collection("audiobooks")
        : songsCollection;
      await collection.deleteOne({ id: fileId });
      send(`❌ File deleted from Drive: ${fileName}. Removed from DB.`);
      continue;
    }
  }

  const progressInfo = `🎼 Syncing ${index + 1} of ${files.length}: ${fileName}`;
  send(progressInfo);

  // Get the existing record
  const collection = isAudiobook ? db.collection("audiobooks") : songsCollection;
  const exists = await collection.findOne({ id: fileId });

  // ✅ Skip already-synced audiobooks unless forced
  if (isAudiobook && exists && !force) {
    alreadySynced++;
    send(`✅ Already synced audiobook: ${fileName}`);
    continue;
  }

  // ✅ Skip already-synced songs unless forced or theme missing
  if (!isAudiobook && exists && !force && "theme" in exists) {
    alreadySynced++;
    send(`✅ Already synced song: ${fileName}`);
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

    /* const meta = await parseBuffer(buffer, mimeType);
    title = meta.common.title || title;
    artist = meta.common.artist || artist;
    duration = meta.format.duration || 0; */

    // Let music-metadata auto-detect the format (better for m4a)
const meta = await parseBuffer(buffer); // remove mimeType

// Fallback for artist (AAC often uses albumartist instead of artist)
title = meta.common.title || title;
artist = meta.common.artist || meta.common.albumartist || "Unknown Artist";
duration = meta.format.duration || 0;
// Fallback for cover
//const pic = meta.common.picture?.[0] || null;


    // Format & quality info
    const format =
      meta.format.container?.toUpperCase() ||
      mimeType?.split("/").pop()?.toUpperCase() ||
      "Unknown";
    const bitrate = meta.format.bitrate
      ? Math.round(meta.format.bitrate / 1000) + "kbps"
      : null;
    const sampleRate = meta.format.sampleRate
      ? (meta.format.sampleRate / 1000).toFixed(1) + "kHz"
      : null;
    const bitDepth = meta.format.bitsPerSample
      ? `${meta.format.bitsPerSample}-bit`
      : null;

    const qualityText = [format, sampleRate, bitrate].filter(Boolean).join(" · ");
    send(`📐 Quality Info: ${qualityText}`);

    // Handle cover image & theme
    const pic = meta.common.picture?.[0];
    if (pic) {
      send(`📤 Uploading cover image...`);
      const imageBuffer = Buffer.from(pic.data);
      const imageStream = Readable.from(imageBuffer);

      function sanitizeFilename(filename) {
        return filename.replace(/[^a-zA-Z0-9-_ ]/g, "_");
      }
      function removeExtension(filename) {
        return filename.replace(/\.[^/.]+$/, "");
      }

      const sanitizedSongName = sanitizeFilename(removeExtension(fileName));
      const albumArtFilename = `${sanitizedSongName}_cover.jpg`;

      const { data: uploaded } = await drive.files.create({
        requestBody: {
          name: albumArtFilename,
          mimeType: pic.format || "image/jpeg",
          parents: [process.env.GOOGLE_DRIVE_COVER_FOLDER],
        },
        media: {
          mimeType: pic.format || "image/jpeg",
          body: imageStream,
        },
      });

      cover = `https://drive.google.com/uc?export=view&id=${uploaded.id}`;
      send(`✅ Cover uploaded: ${uploaded.id}`);

      send(`🎨 Extracting color palette...`);
      const palette = await Vibrant.from(imageBuffer).getPalette();
      theme = {
        vibrant: palette.Vibrant?.hex || null,
        darkVibrant: palette.DarkVibrant?.hex || null,
        lightVibrant: palette.LightVibrant?.hex || null,
        muted: palette.Muted?.hex || null,
        darkMuted: palette.DarkMuted?.hex || null,
        lightMuted: palette.LightMuted?.hex || null,
      };
      send(`✅ Theme colors extracted`);
    } else {
      theme = false;
      send(`🎨 No cover found: ${fileName} (skipping theme generation)`);
    }

    let lyrics_snippet = null;
    if (meta.common.lyrics && meta.common.lyrics.length > 0) {
      lyrics_snippet = meta.common.lyrics[0].slice(0, 150);
      send(`📝 Lyrics snippet extracted`);
    }

    const bpm = meta.common.bpm || null;
    const key = meta.common.key || null;
    const album = meta.common.album || null;
    const genre = meta.common.genre?.[0] || null;
    const year = meta.common.year?.toString() || null;
    const coverFilename = `${fileId}_cover.jpg`;

    send(bpm ? `📐 BPM Detected: ${bpm}` : `📐 BPM Detection Failed!`);
    send(`🧠 Generating tags...`);
    const tags = autoTags({
      title,
      artist,
      album,
      genre,
      bpm,
      key,
      year,
      lyrics_snippet,
      qualityText,
      coverFilename,
    });
    send(`✅ Tags generated: ${tags.join(", ")}`);
    send(`💾 Saving to database...`);

    // Upsert in DB
    const doc = {
      id: fileId,
      title,
      artist,
      album,
      cover,
      duration,
      theme,
      format,
      year,
      key,
      bpm,
      bitrate,
      sampleRate,
      bitDepth,
      qualityText,
      tags,
      ...(isAudiobook ? { type: "audiobook", url: `/api/song?id=${fileId}` } : {}),
    };

    await collection.updateOne({ id: fileId }, { $set: doc }, { upsert: true });
    send(`✅ ${isAudiobook ? "Audiobook" : "Song"} synced: ${title}`);
    synced++;
  } catch (err) {
    send(`❌ Error syncing ${fileName}: ${err.message}`);
  }
}


        send(`🎉 Sync complete.`);
        send(`🔁 Already synced: ${alreadySynced}`);
        send(`🆕 New/Updated: ${synced}`);
        controller.close();
      } catch (err) {
        controller.enqueue(
          encoder.encode(`data: ❌ Failed: ${err.message}\n\n`)
        );
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
