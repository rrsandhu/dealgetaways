import { NextRequest, NextResponse } from "next/server";

const getLiteApi = () => {
  const apiKey = process.env.LITEAPI_API_KEY;
  if (!apiKey) throw new Error("LITEAPI_API_KEY not configured");
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const getInstance = require("liteapi-node-sdk");
  return getInstance(apiKey);
};

/**
 * POST /api/liteapi/search
 * Body: { hotelIds: string[], checkin: string, checkout: string, adults: number, currency?: string }
 * Returns min rates for a list of hotels.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { hotelIds, checkin, checkout, adults = 2, currency = "CAD" } = body;

    if (!hotelIds?.length || !checkin || !checkout) {
      return NextResponse.json(
        { error: "hotelIds, checkin, and checkout are required" },
        { status: 400 }
      );
    }

    const liteapi = getLiteApi();
    const result = await liteapi.getMinRates({
      hotelIds,
      checkin,
      checkout,
      occupancies: [{ adults }],
      currency,
      guestNationality: "CA",
    });

    if (result.status === "failed") {
      return NextResponse.json({ error: result.error }, { status: 502 });
    }

    return NextResponse.json(result.data);
  } catch (err) {
    console.error("[liteapi/search]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
