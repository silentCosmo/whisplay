import { cookies } from "next/headers";
import { google } from "googleapis";
import { NextResponse } from "next/server";

export async function GET(req) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");

  const cookieStore = await cookies();

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );

  const { tokens } = await oauth2Client.getToken(code);

  // 🍪 Store access & refresh token in a secure cookie
  cookieStore().set("google_access_token", tokens.access_token, {
    httpOnly: true,
    secure: true,
    sameSite: "Lax",
    maxAge: 60 * 60 * 24, // 1 day
  });

  if (tokens.refresh_token) {
    cookieStore().set("google_refresh_token", tokens.refresh_token, {
      httpOnly: true,
      secure: true,
      sameSite: "Lax",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });
  }


  const redirectUrl = new URL('/sync', process.env.NEXT_PUBLIC_URL || 'http://localhost:3000');
  return NextResponse.redirect(redirectUrl);

  /* return new Response("🎉 Login successful! You may close this window.", {
    headers: { "Content-Type": "text/html" },
  }); */
}
