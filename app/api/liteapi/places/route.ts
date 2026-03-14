import { NextRequest, NextResponse } from "next/server";
import { searchPlaces } from "@/lib/liteapi-server";

export async function GET(req: NextRequest) {
  const q = new URL(req.url).searchParams.get("q") ?? "";
  if (q.length < 2) return NextResponse.json({ data: [] });

  try {
    const result = await searchPlaces(q);
    return NextResponse.json(result);
  } catch (err) {
    console.error("[liteapi/places]", err);
    return NextResponse.json({ data: [] });
  }
}
