import { google } from "googleapis";

export async function GET() {
  try {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
      },
      scopes: ["https://www.googleapis.com/auth/drive.readonly"],
    });

    const drive = google.drive({ version: "v3", auth });

    const folderId = process.env.GOOGLE_FOLDER_ID;
    const res = await drive.files.list({
      q: `'${folderId}' in parents and mimeType contains 'audio'`,
      fields: "files(id, name, mimeType)",
    });

    console.log(res.data.files);
    

    return Response.json(res.data.files);
  } catch (err) {
    console.error("Drive fetch failed:", err);
    return Response.json({ error: "Failed to fetch Drive files." }, { status: 500 });
  }
}
