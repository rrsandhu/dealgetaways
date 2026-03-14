import { NextRequest, NextResponse } from "next/server";

const getLiteApi = () => {
  const apiKey = process.env.LITEAPI_API_KEY;
  if (!apiKey) throw new Error("LITEAPI_API_KEY not configured");
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const getInstance = require("liteapi-node-sdk");
  return getInstance(apiKey);
};

/**
 * POST /api/liteapi/rates/[hotelId]
 * Body: { checkin: string, checkout: string, adults: number, currency?: string }
 * Returns full room rates and availability for a specific hotel.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ hotelId: string }> }
) {
  try {
    const { hotelId } = await params;
    const body = await req.json();
    const { checkin, checkout, adults = 2, currency = "CAD" } = body;

    if (!checkin || !checkout) {
      return NextResponse.json(
        { error: "checkin and checkout are required" },
        { status: 400 }
      );
    }

    const liteapi = getLiteApi();
    const result = await liteapi.getFullRates({
      hotelIds: [hotelId],
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
    console.error("[liteapi/rates]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
