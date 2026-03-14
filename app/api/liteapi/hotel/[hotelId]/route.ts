import { NextRequest, NextResponse } from "next/server";
import { getHotelDetails } from "@/lib/liteapi-server";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ hotelId: string }> }
) {
  try {
    const { hotelId } = await params;
    const result = await getHotelDetails(hotelId);
    return NextResponse.json(result);
  } catch (err) {
    console.error("[liteapi/hotel]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
