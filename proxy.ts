// NOTE: Clerk is temporarily disabled. Replace this with the Clerk version
// once you add real NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY + CLERK_SECRET_KEY to .env.local
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default function proxy(req: NextRequest) {
  const url = req.nextUrl;
  const utmSource = url.searchParams.get("utm_source");
  const response = NextResponse.next();

  if (utmSource) {
    const utmData = JSON.stringify({
      utm_source: utmSource,
      utm_medium: url.searchParams.get("utm_medium"),
      utm_campaign: url.searchParams.get("utm_campaign"),
      utm_content: url.searchParams.get("utm_content"),
      utm_term: url.searchParams.get("utm_term"),
      captured_at: new Date().toISOString(),
      landing_page: url.pathname,
    });
    response.cookies.set("_chd_utm", utmData, {
      maxAge: 30 * 24 * 60 * 60,
      path: "/",
      httpOnly: true,
      sameSite: "lax",
    });
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.svg$).*)",
  ],
};
