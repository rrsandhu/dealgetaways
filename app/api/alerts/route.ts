import { NextRequest, NextResponse } from "next/server";

// Auth disabled — all endpoints return 401 until Clerk is re-enabled

export async function GET(_req: NextRequest) {
  return NextResponse.json({ alerts: [] });
}

export async function POST(_req: NextRequest) {
  return NextResponse.json({ error: "Authentication required" }, { status: 401 });
}

export async function DELETE(_req: NextRequest) {
  return NextResponse.json({ error: "Authentication required" }, { status: 401 });
}
