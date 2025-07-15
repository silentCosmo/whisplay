import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  cookies().delete("google_access_token");
  cookies().delete("google_refresh_token");

  return NextResponse.redirect(new URL("/", process.env.NEXT_PUBLIC_BASE_URL));
}
