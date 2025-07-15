// /app/api/oauth/login/route.js
import { NextResponse } from "next/server";

export async function GET() {
  const redirectUri = process.env.GOOGLE_REDIRECT_URI;
  const clientId = process.env.GOOGLE_CLIENT_ID;

  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&scope=https://www.googleapis.com/auth/drive.readonly%20https://www.googleapis.com/auth/drive.file&access_type=offline&prompt=consent`;

  return NextResponse.redirect(authUrl);
}
