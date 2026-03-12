import { NextRequest, NextResponse } from "next/server";

// Auth disabled — redirect to sign-in until Clerk is re-enabled
export async function POST(req: NextRequest) {
  return NextResponse.redirect(new URL("/sign-in", req.url));
}
