import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  const cookieStore = cookies();
  const token = cookieStore.get("google_access_token")?.value;

  return NextResponse.json({ loggedIn: !!token });
}
