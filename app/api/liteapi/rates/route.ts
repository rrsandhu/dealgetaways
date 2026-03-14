import { NextRequest, NextResponse } from "next/server";
import { searchRates } from "@/lib/liteapi-server";

/**
 * POST /api/liteapi/rates
 * Body: { placeId?, hotelIds?, aiSearch?, checkin, checkout, adults, currency?, maxRatesPerHotel? }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { placeId, hotelIds, aiSearch, checkin, checkout, adults = 2, currency = "CAD", maxRatesPerHotel } = body;

    if (!checkin || !checkout) {
      return NextResponse.json({ error: "checkin and checkout are required" }, { status: 400 });
    }
    if (!placeId && !hotelIds?.length && !aiSearch) {
      return NextResponse.json({ error: "placeId, hotelIds, or aiSearch is required" }, { status: 400 });
    }

    const result = await searchRates({
      placeId,
      hotelIds,
      aiSearch,
      checkin,
      checkout,
      adults: Number(adults),
      currency,
      ...(maxRatesPerHotel !== undefined && { maxRatesPerHotel }),
    });

    return NextResponse.json(result);
  } catch (err) {
    console.error("[liteapi/rates]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
