import { NextRequest, NextResponse } from "next/server";

const getLiteApi = () => {
  const apiKey = process.env.LITEAPI_API_KEY;
  if (!apiKey) throw new Error("LITEAPI_API_KEY not configured");
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const getInstance = require("liteapi-node-sdk");
  return getInstance(apiKey);
};

/**
 * GET /api/liteapi/hotels?countryCode=CA&cityName=Toronto&limit=20
 * Returns hotel list for a city.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const countryCode = searchParams.get("countryCode") ?? "CA";
    const cityName = searchParams.get("cityName");
    const limit = Number(searchParams.get("limit") ?? 20);

    if (!cityName) {
      return NextResponse.json({ error: "cityName is required" }, { status: 400 });
    }

    const liteapi = getLiteApi();
    const result = await liteapi.getHotels(
      { countryCode, cityName, limit },
      "en"
    );

    if (result.status === "failed") {
      return NextResponse.json({ error: result.error }, { status: 502 });
    }

    return NextResponse.json(result.data);
  } catch (err) {
    console.error("[liteapi/hotels]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
