import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/alerts(.*)",
  "/saved-searches(.*)",
]);

export default clerkMiddleware(async (auth, req: NextRequest) => {
  if (isProtectedRoute(req)) {
    const { userId } = await auth();
    if (!userId) {
      const signInUrl = new URL("/sign-in", req.url);
      signInUrl.searchParams.set("redirect_url", req.url);
      return NextResponse.redirect(signInUrl);
    }
  }

  // UTM tracking cookie
  const url = req.nextUrl;
  const utmSource = url.searchParams.get("utm_source");
  if (utmSource) {
    const res = NextResponse.next();
    res.cookies.set(
      "_chd_utm",
      JSON.stringify({
        utm_source: utmSource,
        utm_medium: url.searchParams.get("utm_medium"),
        utm_campaign: url.searchParams.get("utm_campaign"),
        utm_content: url.searchParams.get("utm_content"),
        utm_term: url.searchParams.get("utm_term"),
        captured_at: new Date().toISOString(),
        landing_page: url.pathname,
      }),
      { maxAge: 30 * 24 * 60 * 60, path: "/", httpOnly: true, sameSite: "lax" }
    );
    return res;
  }
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.svg$).*)",
  ],
};
