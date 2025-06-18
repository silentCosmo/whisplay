import { google } from "googleapis";

export async function GET(req, { params }) {
  const { id } = await params;

  try {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
      },
      scopes: ["https://www.googleapis.com/auth/drive.readonly"],
    });

    const drive = google.drive({ version: "v3", auth });

    // 🔍 Look for a file like "<song_id>_cover.jpg" inside the cover folder
    const list = await drive.files.list({
      q: `'${process.env.GOOGLE_DRIVE_COVER_FOLDER}' in parents and name = '${id}_cover.jpg'`,
      fields: "files(id, name)",
    });

    const file = list.data.files?.[0];

    if (!file) {
      return new Response("Cover not found", { status: 404 });
    }

    const { data } = await drive.files.get(
      { fileId: file.id, alt: "media" },
      { responseType: "stream" }
    );

    return new Response(data, {
      headers: {
        "Content-Type": "image/jpeg",
        "Cache-Control": "public, max-age=604800",
      },
    });
  } catch (err) {
    console.error("Cover proxy failed:", err);
    return new Response("Failed to load cover", { status: 500 });
  }
}
